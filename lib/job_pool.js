'use strict';

const weighted = require('weighted');
const StatReporter = require('./stat_reporter');
const Util = require('./util');
const DebugLogger = require('debug-logger')('JobPool');

class JobPool {
	constructor(params) {
		this.redis_client = params.redis_client;
		this.config = params.config;
		this.logKeys = {};
		this.running = true;
	}

	start() {
		if (this.config.streamer.enable_stat) {
			this.stat_collector = new StatReporter(this.config.streamer.stat_interval || 60000);
			this.stat_collector.start().then(() => {}).catch((e) => {});
		}
		DebugLogger.info('job pool starting');

		this.scan().then(() => {}).catch((e) => {});
	}

	stop() {
		this.running = false
	}

	/**
	 * keep scanning the redis and put the keys into this.logKeys
	 * @returns {Promise<void>}
	 */
	async scan() {
		while (this.running) {
			try {
				const keys = await this.redis_client.scan('0', 'match', `${this.config.streamer.key_prefix}:*`, 'count', '10000');
				if (keys && keys[1]) {
					for (const key of keys[1]) {
						if (!this.logKeys[key]) {
							this.logKeys[key] = this.config.streamer.send_batch_size;
						}
					}
				}


			} catch (e) {
				DebugLogger.error(e);
			} finally {
				await Util.delay(this.config.streamer.scan_interval);
			}
		}
	}

	/**
	 * extract the jobs from this.logKeys
	 */
	dispatchJobs() {
		const job = this.getJob(this.logKeys);

		if (!job) {
			return;
		}

		if (this.stat_collector) {
			this.stat_collector.add(job.key)
		}

		return job;
	}

	getJob(targets) {
		try {
			const target = weighted.select(targets);
			const rest = targets[target] - this.config.send_batch_size;
			if (rest >= 0) {
				targets[target] = rest;
			} else {
				targets[target] = 0;
			}
			return {key: target};
		} catch (e) {
			return null;
		}
	}

	report(target, num_of_left) {
		this.logKeys[target] = num_of_left;
	}

}

module.exports = JobPool;

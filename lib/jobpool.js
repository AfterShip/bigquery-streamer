'use strict';

var weighted = require('weighted');
var co = require("co");
var bluebird = require("bluebird");
var log = require('debug-logger')('jobpool');
class JobPool {
	constructor(params) {
		this.services = params.services;
		this.config = params.config;
		this.targets = {};
		this.should_stop = false;
		this.callbacks = [];
	}

	start() {
		if (this.config.streamer.enable_stat) {
			this.stat_collector = new StatReporter(this.config.streamer.stat_interval || 60000);
			this.stat_collector.start();
		}
		this.scan();
		log.info("starting");
	}

	scan() {
		var self = this;
		return co(function*() {
			while (!self.should_stop) {
				try {
					var keys = yield self.services.redis_client.keys(`${self.config.streamer.key_prefix}:*`);
					for (let key of keys) {
						if (!self.targets[key]) {
							self.targets[key] = self.config.streamer.send_batch_size;
						}
					}
					self.dispatchJobs();
				} catch (e) {
					log.error(e);
				} finally {
					yield bluebird.delay(self.config.streamer.scan_interval);
				}
			}
		});
	}

	stop() {
		this.should_stop = false;
	}

	pull(callback) {
		this.callbacks.push(callback);
		this.dispatchJobs();
	}

	//may throw error if no available target
	getJob() {
		return this._getJob(this.targets, this.stat_collector);
	}

	_getJob(targets, stat_collector) {
		try {
			let target = weighted.select(targets);
			let rest = targets[target] - this.config.send_batch_size;
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

	dispatchJobs() {
		while (true) {
			if (this.callbacks.length > 0) {
				let job = this.getJob();
				if (job) {
					let cb = this.callbacks.pop();
					if (this.stat_collector) {
						this.stat_collector.add(job.key)
					}
					return cb(null, job);
				} else {
					break;
				}
			} else {
				break;
			}
		}
	}

	report(target, num_of_left) {
		this.targets[target] = num_of_left;
		this.dispatchJobs();
	}

}

JobPool.prototype.pullAsync = bluebird.promisify(JobPool.prototype.pull);

class StatReporter {

	constructor(delay) {
		this.logger = require('debug-logger')('jobpool_stat');
		this.stat = {};
		this.delay = delay;
	}

	add(key) {
		if (!this.stat[key]) {
			this.stat[key] = 1;
		} else {
			this.stat[key] = this.stat[key] + 1
		}
	}

	start() {
		let self = this;
		co(function*() {
			while (true) {
				yield bluebird.delay(self.delay);
				let count = 0;
				require("lodash").forOwn(self.stat, function (value, key) {
					count += value;
				});
				self.logger.info(`${count} jobs dispatched in ${self.delay}ms`);
				self.stat = {};
			}
		})
	}
}

module.exports = JobPool;

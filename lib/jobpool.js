'use strict';

var weighted = require('weighted');
var co = require("co");
var bluebird = require("bluebird");
var log = require('debug-logger')('jobpool');
class JobPool {
	constructor(params) {
		this.services = params.services;
		this.config = params.config.streamer;
		this.targets = {};
		this.should_stop = false;
		this.callbacks = [];
	}

	start() {
		this.scan();
		log.debug("job pool started.");
	}

	scan() {
		var self = this;
		return co(function*() {
			while (!self.should_stop) {
				try {
					var keys = yield self.services.redis_client.keys(`${self.config.key_prefix}:*`);
					for (let key of keys) {
						if (!self.targets[key]) {
							self.targets[key] = 10;
						}
					}
					log.debug("scanned, cur")
					//log.debug("scanned, current targets:", self.targets);
					self.dispatchJobs();
				} catch (e) {
					log.error(e);
				} finally {
					yield bluebird.delay(self.config.scan_interval);
				}
			}
		});
	}

	stop() {
		this.should_stop = false;
	}

	pull(callback){
		this.callbacks.push(callback);
		this.dispatchJobs();
	}

	//may throw error if no available target
	getJob() {
		return this._getJob(this.targets);
	}

	_getJob(targets) {
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
			if(this.callbacks.length > 0){
				let job = this.getJob();
				if(job){
					let cb = this.callbacks.pop();
					return cb(null, job);
				}else{
					break;
				}
			}else{
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

module.exports = JobPool;

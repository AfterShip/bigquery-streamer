'use strict';
var Redis = require("ioredis");
var bluebird = require("bluebird");
var gcloud = require('gcloud');
var JobPool = require("./jobpool");
var Sender = require("./sender");
var co = require("co");
var _ = require("lodash");
bluebird.promisifyAll(require('gcloud/lib/bigquery').prototype);
bluebird.promisifyAll(require('gcloud/lib/bigquery/dataset').prototype);
bluebird.promisifyAll(require('gcloud/lib/bigquery/table').prototype);

class Streamer {
	constructor(config) {
		this.config = config;
		let services = {
			redis_client: new Redis(_.merge(config.redis, {
				reconnectOnError: function (err) {
					const targetError = 'READONLY';
					if (err.message.includes(targetError)) {
						return 2;
					}
				},
				retryStrategy: function (times) {
					return 500;
				}
			})),
			bq_client: gcloud(config.gcloud).bigquery()
		};


		this.job_pool = new JobPool({
			services: services,
			config: config
		});
		this.senders = [];
		for (let i = 0; i < config.streamer.senders; i++) {
			let sender = new Sender({
				services: services,
				config: config,
				job_pool: this.job_pool
			});
			this.senders.push(sender);
		}
	}

	start() {
		let self = this;
		co(function*() {
			self.job_pool.start();
			for (let sender of self.senders) {
				sender.start();
			}
		});
	}

	stop() {
		this.job_pool.stop();
		for (let sender of this.senders) {
			sender.start();
		}
	}

	updateConfig(config) {
		this.job_pool.config = config;
		for (let sender of this.senders) {
			sender.config = config;
		}
	}
}


module.exports = Streamer;

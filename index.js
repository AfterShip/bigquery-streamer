'use strict';

const Redis = require('ioredis');
const {BigQuery} = require('@google-cloud/bigquery');
const JobPool = require('./lib/job_pool');
const Sender = require('./lib/sender');
const _ = require('lodash');

class Streamer {
	constructor(config) {
		this.config = config;

		const services = {
			redis_client: Streamer.getRedis(config),
			bq_client: new BigQuery(config.gcloud)
		};

		this.jobPool = new JobPool({
			redis_client: services.redis_client,
			config: config
		});

		this.senders = [];

		for (let i = 0; i < config.streamer.senders; i++) {
			const sender = new Sender({
				services: services,
				config: config,
				jobPool: this.jobPool
			});
			this.senders.push(sender);
		}
	}

	static getRedis(config) {
		return new Redis(_.merge(config.redis, {
			reconnectOnError: function (err) {
				const targetError = 'READONLY';
				if (err.message.includes(targetError)) {
					return 2;
				}
			},
			retryStrategy: function (times) {
				return 500;
			}
		}))
	}


	start() {
		this.jobPool.start();

		for (const sender of this.senders) {
			sender.start().then(() => {}).catch(() => {});
		}
	}

	stop() {
		this.jobPool.stop();
		for (const sender of this.senders) {
			sender.stop();
		}
	}

	updateConfig(config) {
		this.jobPool.config = config;
		for (const sender of this.senders) {
			sender.config = config;
		}
	}
}


module.exports = Streamer;

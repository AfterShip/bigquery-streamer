'use strict';
var co = require("co");
var bluebird = require("bluebird");
var retry = require("co-retry");
var _ = require("lodash");
var moment = require("moment");

class Sender {
	constructor(params) {
		this.config = params.config.streamer;
		this.services = params.services;
		this.should_stop = false;
		this.job_pool = params.job_pool;
		this.reporter = params.reporter;
		this.id = this.makeid();
		this.logger = require('debug-logger')(`sender:${this.id}`)

	}

	start() {
		var self = this;
		self.logger.debug("starting");
		return co(function* () {
			while (!self.should_stop) {
				var job = yield self.job_pool.pullAsync();
				self.logger.debug("get a job", job);
				try {
					let left = yield self.doJob(job);
					self.job_pool.report(job.key, left);
				} catch (e) {
					self.logger.error(new Date(), e);
					//todo report here
				}
			}
		});
	}

	makeid()
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 5; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}


	stop() {
		this.should_stop = true;
	}

	/**
	 *
	 * @param job
	 * @returns {number}
	 */
	doJob(job) {
		var self = this;
		return co(function*() {
			let key = job.key;
			let res = yield self.batchPop(self.services.redis_client, key, self.config.send_batch_size);
			if (res.data && res.data.length) {
				let bq_params = self.getBQParams(key);
				let data = yield self.preProcessData(res.data, self.config.max_row_size, bq_params.table_definition);
				yield self.sendToBigQuery({
					bq_client: self.services.bq_client,
					table_definition: bq_params.table_definition,
					table_id: bq_params.table_id,
					dataset_id: bq_params.dataset_id,
					data: data
				});
				return yield self.services.redis_client.llen(key);
			} else {
				return 0;
			}
		});
	}

	getBQParams(full_key) {
		var self = this;
		let key_parts = full_key.split(':');
		let subject = key_parts[1];
		let version = key_parts[2];
		let key = key_parts[3];
		if (subject && key && version && self.config.table_definitions[subject][version]) {

			var table_id = `${moment().utc().format('YYYYMMDD')}_${key}`;
			var dataset_id = `${self.config.dataset_namespace}_${subject}_${version}`;
			var table_definition = self.config.table_definitions[subject][version];
			return {
				"table_definition": table_definition,
				"table_id": table_id,
				"dataset_id": dataset_id
			}
		} else {
			throw new Error(`no schema found for: {key}`);
		}

	}

	preProcessData(records, max_row_size, table_definition) {

		let results = [];


		//move unexpected fields to cargo
		for (let raw_record of records) {

			let record = JSON.parse(raw_record);

			//compress if raw size > limit
			if (Buffer.byteLength(raw_record) > max_row_size) {
				_.forEach(table_definition.strippable_fields, function (field) {
					delete record[field]
				});
			}

			let cargo = record.cargo || {};

			//schema check

			//cache schema fields
			if (!table_definition.field_map) {
				table_definition.field_map = {};
				_.forEach(table_definition.fields, function (field) {
					table_definition.field_map[field.name] = field.type
				});
			}

			_.forOwn(record, function (value, key) {
				//only do existence check
				if (!table_definition.field_map.hasOwnProperty(key)) {
					cargo[key] = value;
					delete record[key];
				}
			});

			if (!_.isEmpty(cargo)) {
				record.cargo = JSON.stringify(cargo);
			}

			results.push(record);
		}

		return results;

	}

	batchPop(redis_client, key, size) {
		return co(function* () {
			var res = yield redis_client.multi()
				.lrange(key, 0, size - 1)
				.ltrim(key, size, -1)
				.exec();
			return {
				data: res[0][1]
			};
		});
	}

	/**
	 * send to bigquery with retry
	 * @property params
	 * @property {object} params.bq_client - bigquery client
	 * @property {string} params.dataset_id - target dataset_id
	 * @property {string} params.table_id - target table_id
	 * @property {string} params.schema - schema of table
	 * @property {string} params.data - data to send
	 * @returns {*}
	 */
	sendToBigQuery(params) {
		var self = this;
		return retry(function* () {
			var dataset = params.bq_client.dataset(params.dataset_id);
			var table = dataset.table(params.table_id);
			try {
				let res = yield table.insertAsync(params.data);
				self.logger.debug(`sent ${params.dataset_id} ${params.table_id}`);
				return res;
			} catch (e) {
				if (e.code === 404) {
					if (e.message.includes("Not found: Table")) {
						yield dataset.createTableAsync({
							id: params.table_id,
							schema: {
								fields: params.table_definition.fields
							}
						});
						return yield table.insertAsync(params.data);
					} else if (e.message.includes("Not found: Dataset")) {
						yield params.bq_client.createDatasetAsync(params.dataset_id);
						yield dataset.createTableAsync({
							id: params.table_id,
							schema: params.schema
						});
						return yield table.insertAsync(params.data);
					} else {
						throw e;
					}
				} else {
					throw e;
				}
			}
		}, {retries: 10, interval: 500, factor: 2});
	}


}

module.exports = Sender;
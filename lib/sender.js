'use strict';
var co = require("co");
var bluebird = require("bluebird");
var retry = require("co-retry");
var _ = require("lodash");
var moment = require("moment");

class Sender {
	constructor(params) {
		this.config = params.config;
		this.services = params.services;
		this.should_stop = false;
		this.job_pool = params.job_pool;
		this.logger = require('debug-logger')("sender");
	}

	start() {
		var self = this;
		self.logger.info("starting");
		return co(function* () {
			while (!self.should_stop) {
				var job = yield self.job_pool.pullAsync();
				try {
					let res = yield self.doJob(job);
					if (res) {
						self.job_pool.report(job.key, res.left);
						self.logger.trace("job done:", job);
					}
				} catch (e) {
					self.logger.error(new Date(), e);
				}
			}
		});
	}

	stop() {
		this.should_stop = true;
	}

	/**
	 *
	 * @param job
	 * @returns {object}
	 */
	doJob(job) {
		var self = this;
		return co(function*() {
			let key = job.key;
			let res = yield self.batchPop(self.services.redis_client, key, self.config.streamer.send_batch_size);
			if (res.data && res.data.length) {
				let bq_params = self.getBQParams(key);
				let data = yield self.preProcessData(res.data, self.config.streamer.max_row_size, bq_params.table_definition);
				let bq_res = yield self.sendToBigQuery({
					bq_client: self.services.bq_client,
					table_definition: bq_params.table_definition,
					table_id: bq_params.table_id,
					dataset_id: bq_params.dataset_id,
					data: data,
					retries: self.config.streamer.retries,
					retry_interval: self.config.streamer.retry_interval
				});
				//bad but due to no way to let co-retry filter error retryale or not
				if (bq_res[1] && bq_res[1].insertErrors) {
					throw new Error("Insert Error:" + bq_params.dataset_id);
				}
				return {
					sent: data.length,
					left: yield self.services.redis_client.llen(key),
					dataset: bq_params.dataset_id
				};
			} else {
				return null;
			}
		});
	}

	getBQParams(full_key) {
		var self = this;
		let key_parts = full_key.split(':');
		let subject = key_parts[1];
		let version = key_parts[2];
		let key = key_parts[3];
		if (subject && key && version && self.config.streamer.table_definitions[subject][version]) {

			var table_id = `${moment().utc().format('YYYYMMDD')}_${key}`;
			var dataset_id = `${self.config.streamer.dataset_namespace}_${subject}_${version}`;
			var table_definition = self.config.streamer.table_definitions[subject][version];
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

				let field_map = table_definition.field_map;
				if (key !== "cargo" && value !== null && value !== undefined) {
					if ((!field_map.hasOwnProperty(key))
						|| (table_definition.field_map[key] === "STRING" && typeof value !== 'string')
						|| (table_definition.field_map[key] === "INTEGER" && typeof value !== 'number')
						|| (table_definition.field_map[key] === "FLOAT" && typeof value !== 'number')
						|| (table_definition.field_map[key] === "TIMESTAMP" && (typeof value !== 'string' && typeof value !== 'number'))
						|| (table_definition.field_map[key] === "BOOLEAN" && typeof value !== 'boolean')
						|| (table_definition.field_map[key] === "RECORD" && typeof value !== 'object')
					) {
						cargo[key] = value;
						delete record[key];
					}
				}
			});

			if (!_.isEmpty(cargo)) {
				record.cargo = JSON.stringify(cargo);
			}else{
				record.cargo = null;
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
				return yield table.insertAsync(params.data);
			} catch (e) {
				if (e.code === 404) {
					if (e.message.includes("Not found: Table")) {
						yield dataset.createTableAsync({
							id: params.table_id,
							schema: {
								fields: params.table_definition.fields
							},
							expirationTime: moment().add(params.table_definition.ttl, 'days').valueOf()
						});
						return yield table.insertAsync(params.data);
					} else if (e.message.includes("Not found: Dataset")) {
						yield params.bq_client.createDatasetAsync(params.dataset_id);
						yield dataset.createTableAsync({
							id: params.table_id,
							schema: {
								fields: params.table_definition.fields
							},
							expirationTime: moment().add(params.table_definition.ttl, 'days').valueOf()
						});
						return yield table.insertAsync(params.data);
					} else {
						self.logger.error(new Date(), e);
						throw e;
					}
				} else {
					self.logger.error(new Date(), e);
					throw e;
				}
			}
		}, {retries: params.retries || 10, interval: params.retry_interval || 500, factor: 2});
	}


}

module.exports = Sender;
'use strict';

const _ = require('lodash');
const moment = require('moment');
const Util = require('./util');
const DebugLogger = require('debug-logger')('Sender');

class Sender {
	constructor(params) {
		this.config = params.config;
		this.services = params.services;
		this.should_stop = false;
		this.jobPool = params.jobPool;
	}

	async start() {
		while (!this.should_stop) {
			const job = this.jobPool.dispatchJobs();

			if (!job) {
				await Util.delay(1000);
				continue;
			}

			try {
				const res = await this.doJob(job);
				if (res) {
					this.jobPool.report(job.key, res.left);
					DebugLogger.trace('job done:', job, res);
				}
			} catch (e) {
				DebugLogger.error(new Date(), e);
			}

			await Util.delay(1000);
		}
	}

	stop() {
		this.should_stop = true;
	}

	/**
	 *
	 * @param job
	 * @returns {object}
	 */
	async doJob(job) {
		const key = job.key;

		const res = await this.batchPop(this.services.redis_client, key, this.config.streamer.send_batch_size);

		if (!res.data || !res.data.length) {
			return null;
		}
		const bq_params = this.getBQParams(key);

		const data = this.getFormattedData(res.data, this.config.streamer.max_row_size, bq_params.table_definition);

		const bq_res = await this.sendToBigQuery({
			bq_client: this.services.bq_client,
			table_definition: bq_params.table_definition,
			dataset_location: bq_params.dataset_location,
			table_id: bq_params.table_id,
			dataset_id: bq_params.dataset_id,
			data: data,
			retries: this.config.streamer.retries,
			retry_interval: this.config.streamer.retry_interval
		});

		//bad but due to no way to let co-retry filter error retryale or not
		if (bq_res[1] && bq_res[1].insertErrors) {
			DebugLogger.error(new Date(), `Data: ${JSON.stringify(data)} Insert Error:  ${key} ${JSON.stringify(bq_res[1].insertErrors)}`);
		}
		return {
			sent: data.length,
			left: await this.services.redis_client.llen(key),
			dataset: bq_params.dataset_id
		};
	}

	getTableId(table_name_format, key) {
		table_name_format = table_name_format ? table_name_format.toLowerCase() : 'yyyymmdd_key';
		switch (table_name_format) {
			case 'yyyymmdd_key':
				return `${moment().utc().format('YYYYMMDD')}_${key}`;
			case 'key_yyyymmdd':
				return `${key}_${moment().utc().format('YYYYMMDD')}`;
			case 'keyyyyymmdd':
				return `${key}${moment().utc().format('YYYYMMDD')}`;
			case 'yyyymmddkey':
				return `${moment().utc().format('YYYYMMDD')}${key}`;
			case 'no_date':
				return `${key}`;
			default:
				return `${moment().utc().format('YYYYMMDD')}_${key}`;
		}
	}

	getBQParams(full_key) {
		const [,subject,version,key] = full_key.split(':');
		
		if (subject && key && version && this.config.streamer.table_definitions[subject][version]) {
			const table_id = this.getTableId(this.config.streamer.table_name_format, key);
			const dataset_id = `${this.config.streamer.dataset_namespace}_${subject}_${version}`;
			const table_definition = this.config.streamer.table_definitions[subject][version];

			return {
				'table_definition': table_definition,
				'table_id': table_id,
				'dataset_id': dataset_id,
				'dataset_location': this.config.streamer.dataset_location
			}
		} else {
			throw new Error(`no schema found - subject: ${subject},  key: ${key}`);
		}

	}

	getFormattedData(records, max_row_size, table_definition) {
		const results = [];

		//move unexpected fields to cargo
		for (const raw_record of records) {
			let record;
			try {
				record = JSON.parse(raw_record);
			} catch (e) {
				// skip the entry if the json is invalid
				continue;
			}

			//compress if raw size > limit
			if (Buffer.byteLength(raw_record) > max_row_size) {
				_.forEach(table_definition.strippable_fields, function(field) {
					delete record[field]
				});
			}

			const cargo = record.cargo || {};

			// cache schema fields
			if (!table_definition.field_map) {
				table_definition.field_map = {};
				_.forEach(table_definition.fields, function(field) {
					table_definition.field_map[field.name] = field.type
				});
			}

			_.forOwn(record, function(value, key) {
				const field_map = table_definition.field_map;
				if (key !== 'cargo' && value !== null && value !== undefined) {
					if (
						(!field_map.hasOwnProperty(key)) ||
						(table_definition.field_map[key] === 'STRING' && typeof value !== 'string') ||
						(table_definition.field_map[key] === 'INTEGER' && typeof value !== 'number') ||
						(table_definition.field_map[key] === 'FLOAT' && typeof value !== 'number') ||
						(table_definition.field_map[key] === 'TIMESTAMP' && (typeof value !== 'string' && typeof value !== 'number')) ||
						(table_definition.field_map[key] === 'BOOLEAN' && typeof value !== 'boolean') ||
						(table_definition.field_map[key] === 'RECORD' && typeof value !== 'object')
					) {
						cargo[key] = value;
						delete record[key];
					}
				}
			});

			if (!_.isEmpty(cargo)) {
				record.cargo = JSON.stringify(cargo);
			} else {
				record.cargo = null;
			}

			const unparse = JSON.stringify(record);
			if (!(Buffer.byteLength(unparse) > max_row_size)) {
				results.push(record);
			}
		}

		return results;

	}

	async batchPop(redis_client, key, size) {
		const res = await redis_client.multi()
			.lrange(key, 0, size - 1)
			.ltrim(key, size, -1)
			.exec();
		return {
			data: res[0][1]
		};
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
	async sendToBigQuery(params) {
		const _this = this;
		return await Util.retry(async function () {
			return await _this.send(params);
		}, {
			retries: params.retries || 10,
			interval: params.retry_interval || 500,
			factor: 2
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
	async send(params) {
		const bigquery = params.bq_client;
		const dataset = bigquery.dataset(params.dataset_id);
		const table = dataset.table(params.table_id);

		try {
			return await table.insert(params.data);
		} catch (e) {
			if (e.code !== 404) {
				console.error(new Date(), e);
				throw e;
			}

			if (e.message.includes('Not found: Table')) {
				// table not found
				await this.createTable(params);
				return await table.insert(params.data);
			} else if (e.message.includes('Not found: Dataset')) {
				// dataset not found
				await this.createDataset(params);
				return await table.insert(params.data);
			} else {
				console.error(new Date(), e);
				throw e;
			}
		}
	}

	async createDataset(params) {
		const bigquery = params.bq_client;
		await bigquery.createDataset(params.dataset_id, {location: (params.dataset_location || 'US')});
		await this.createTable(params);
	}

	async createTable(params) {
		const bigquery = params.bq_client;
		const dataset = bigquery.dataset(params.dataset_id);
		const expirationTime = params.table_definition.ttl ? moment().add(params.table_definition.ttl, 'days').valueOf() : null;

		try {
			await dataset.createTable(params.table_id, {
					schema: {
						fields: params.table_definition.fields
					},
					expirationTime: expirationTime
				});
		} catch(e) {
			if(!e.message.includes('Already Exists: Table')) {
				console.error(new Date(), e);
			}
		}
	}
}

module.exports = Sender;
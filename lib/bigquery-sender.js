/**
 * Created by FeikoLai on 2/1/15.
 */

'use strict';

var Promise = require('bluebird');
var retry = require('bluebird-retry');
var moment = require('moment');
var S = require('string');
var _ = require('lodash');
var uuid = require('node-uuid');

function Sender(params) {
	this.params = params;


}

Sender.prototype.start = function() {
	this.send();
};


Sender.prototype.send = function() {

	var that = this;
	var params = this.params;
	var promisified_redis_client = this.params.promisified_redis_client;

	var key_parse_result;
	pop_multiple(promisified_redis_client, params.key, params.send_batch_size)
		.then(function(items) {

			//filter and send out large contents
			if (items && items.length && items.length > 0) {


				key_parse_result = parse_key(params);

				var archive_items = [];
				var result = [];


				for (var i = 0; i < items.length; i++) {

					var item = items[i];
					var item_json = JSON.parse(item);

					sanitize(item_json, key_parse_result.schema);

					if (Buffer.byteLength(item) < params.max_row_size) {
						result.push(item_json);
					} else {
						var stripped_json = {};
						if (key_parse_result.schema.strippable_fields) {
							stripped_json = _.clone(item_json);
							_.forEach(key_parse_result.schema.strippable_fields, function (field) {
								delete stripped_json[field]
							});

						}
						stripped_json.archive = {
							"type": "gcs",
							"ref1": params.bucket,
							"ref2": key_parse_result.archive_path
						};
						archive_items.push(item_json);
						result.push(stripped_json);
					}
				}


				if (archive_items.length > 0) {
					//send to google cloud storage
					//can be optimize if not prettify or just send strings from redis
					var gcs = params.promisified_gcs_client;
					gcs.objects.insert(
						{
							auth: params.google_client,
							project: params.project_id,
							bucket: params.bucket,
							name: key_parse_result.archive_path,
							media: {
								mimeType: 'application/json',
								body: JSON.stringify(archive_items, null, 2)
							}
						},
						function (err, result) {
							if(err)
							{
								console.error('[gcs]',err,new Date());
							}else
							{
								console.log('[gcs]',params.key,' sent ', new Date())
							}
						}
					)

				}
				return result;
			} else {
				return [];
			}
		})
		.then(function(items) {

			if (items && items.length && items.length > 0) {
				return send_to_bigquery(params, items, {key_parse_result: key_parse_result})
					.then(function() {
						return items.length;
					})
					.catch(function(e) {
						console.error(new Date(), 'failed to sent out:', e, 'data:', JSON.stringify(items));
						return items.length;
					})
					;
			} else {
				return 0;//nothing to send
			}

		})
		.catch(function(e){
			console.error("[sender]" + e);
			return 0;
		})
		.then(function(length) {
			if (length >= params.send_batch_size) {
				var delay = params.min_flush_interval;
			} else {
				var delay = params.min_flush_interval + (params.max_flush_interval - params.min_flush_interval) * (1 - length / params.send_batch_size);
			}
			if (isNaN(delay)) {
				delay = Math.round(params.max_flush_interval) || 1000;
			}

			delay = Math.round(delay);
			console.log('[bq]','key:', params.key, ' sent_length:', length, ' delay:', delay, ' date: ', new Date());
			return Promise.delay(delay)
				.then(function() {
					process.nextTick(function() {
						that.send();
					})
				});

		});

};


function pop_multiple(client, key, size) {
	return new Promise(function(resolve, reject) {
		//transactional operation
		client.multi()
			.lrange(key, 0, size - 1)
			.ltrim(key, size, -1)
			.exec(function(err, results) {
				if (err) {
					reject(err);
				} else {
					if (results && results[0]) {
						resolve(results[0]);
					} else {
						reject(new Error('no result'));//todo handle error
					}

				}
			})
	});

}


/**
 * Send logs to Big Query, if target table does not exist, create one and retry
 * @param params
 */
function send_to_bigquery(params, json_items, cargo) {
	var promisified_bigquery_client = params.promisified_bigquery_client;

	var parse_result = cargo.key_parse_result;

	var req_body = {
		"auth": params.google_client,
		"projectId": params.project_id,
		"datasetId": parse_result.dataset_id,
		"tableId": parse_result.table_id,
		"resource": {
			"kind": "bigquery#tableDataInsertAllRequest",
			"rows": _.map(json_items, function(d) {
				return {
					json: d,
					insertId: uuid.v4()
				};
			})
		}
	};

	var send = function() {
		return promisified_bigquery_client.tabledata.insertAllAsync(req_body);
	};

	var create_table = function() {


		var request_body = {
			"auth": params.google_client,
			"projectId": params.project_id,
			"datasetId": parse_result.dataset_id,
			"tableId": parse_result.table_id,
			"resource": {
				"kind": "bigquery#table",
				"tableReference": {
					"projectId": params.project_id,
					"datasetId": parse_result.dataset_id,
					"tableId": parse_result.table_id
				},
				"schema": {
					"fields": parse_result.schema.fields
				}
			}
		};

		if (parse_result.schema.ttl) {
			request_body["resource"]["expirationTime"] = moment().add(parse_result.schema.ttl, 'days').valueOf();
		}
		return promisified_bigquery_client.tables.insertAsync(request_body);
	};

	var create_dataset = function() {
		return promisified_bigquery_client.datasets.insertAsync({
			"auth": params.google_client,
			"projectId": params.project_id,
			"resource": {
				"kind": "bigquery#dataset",
				"datasetReference": {
					"datasetId": parse_result.dataset_id,
					"projectId": params.project_id
				},
				"access": [
					{
						"specialGroup": "allAuthenticatedUsers",
						"role": "OWNER"
					}
				]
			}
		})
	};

	var attempt = function() {
		return send()
			.catch(function(e) {
				if (e.code === 404 || S(e.message).contains('Not Found')) { //table or dataset not found, create them and re-send
					return create_dataset()
						.catch(function(e) {
							console.error("[BQ:create:dataset]",e, new Date());//ignore it
						})
						.then(create_table)
						.catch(function(e) {
							console.error("[BQ]:create:table",e, new Date());//ignore it
						})
						.then(send)
				}
				else {
					throw e;
				}
			})
			.spread(function(resp) {
				if (resp && resp.insertErrors) {
					throw new Error(params.key + ' insert failed: ' + JSON.stringify(resp || {}));
				} else {
					return true;
				}
			})
	};

	//retry with exponential backoff
	return retry(attempt, {timeout: 300000, interval: 250, backoff: 2, max_tries: 10});

}

function parse_key(params) {
	var key_parts = params.key.split(':');

	var achive_name = uuid.v4();


	var table_id = moment().utc().format('YYYYMMDD') + '_' + key_parts[3] || "unknown";
	var dataset_id = params.dataset_namespace + '_' + key_parts[1] + '_' + key_parts[2];
	var archive_path = moment().utc().format('YYYYMMDD') + '/' + key_parts[1] + '/' + key_parts[2] + '/' + key_parts[3] + '/' + achive_name;

	if (key_parts.length === 4 && params.schemas[key_parts[1]] && params.schemas[key_parts[1]][key_parts[2]]) {
		var schema = params.schemas[key_parts[1]][key_parts[2]];
	}else
	{
		throw new Error('no schema found for:'+ params.key);
	}

	return {
		"schema": schema,
		"table_id": table_id,
		"dataset_id": dataset_id,
		"archive_path": archive_path
	};
}

function sanitize(item_json, schema)
{
	//NOTE: better pattern: immutable input, return a new output

	//cargo special handling
	if(item_json.cargo)
	{
		item_json.cargo = JSON.stringify(item_json.cargo);
	}

	//validate against schema, move unknown fields to cargo for minimum data loss
	//simple validation only by field name

	//caching field map
	if(!schema.field_map)
	{
		schema.field_map = {};
		_.forEach(schema.fields, function(field){ schema.field_map[field.name] = field.type  });
	}

	//validate
	var unknown_fields = {};
	_.forEach(item_json, function(value,key){
		if(!schema.field_map.hasOwnProperty(key))
		{
			unknown_fields[key] = value;
			delete item_json[key];
		}
	});

	if(!_.isEmpty(unknown_fields))
	{
		item_json.cargo = JSON.stringify(unknown_fields);
	}
}


module.exports = Sender;

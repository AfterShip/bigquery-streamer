/**
 * Created by FeikoLai on 30/12/14.
 */
var google = require('googleapis');
var bigquery = google.bigquery('v2');
var gcs = google.storage('v1');
var redis = require("redis");
var Promise = require("bluebird");
var _ = require('lodash');
var Scheduler = require('./bigquery-scheduler');

/**
 * Bigquery Streamer Config
 * @typedef {object} StreamerConfig
 *
 * redis
 * @property {object} [redis_client] - an redis_client to fetch data, if this is provided, redis_port and redis_host would be ignored.
 * @property {string} [redis_host] - address of the redis host to fetch data.
 * @property {number} [redis_port] - port of the redis host to fetch data.
 * @property {number} [redis_db] -  the db of redis to where streamer fetch data from.
 *
 * sender
 * @property {number} [max_idle_time = 10000] - Max idle time in millisecond for a sender to wait before next fetch
 * @property {number} [min_idle_time = 0] - Min idle time in millisecond for a sender to wait before next fetch
 * @property {number} [send_batch_size = 100] - the batch size of every BigQuery stream insert
 *
 * @property {string} email - Google api authentication email
 * @property {string} bucket - bucket in Google Cloud Storage for archive
 * @property {string} project_id - project_id of destination BigQuery
 * @property {string} dataset_namespace - the (namespace) prefix of auto created datasets
 * @property {number} max_row_size - record over this size will be trimmed and archived to GCS
 * @property {number} schedule_interval - the interval for scheduler to scan new keys
 * @property {TableDefinition} table_definitions
 */


/**
 * Config Table Definition
 * @typedef {object} TableDefinition
 * @property {string} subject - subject of table
 * @property {string} subject.version - version of subject above
 * @property {object[]} subject.version.fields - array of field definitions, ref: https://cloud.google.com/bigquery/loading-data-into-bigquery
 * @property {string[]} subject.version.strippable_fields - array of fields which will be stripped when the item size is greater than max_row_size
 * @property {number} subject.version.ttl - ttl of table in days
 */


/**
 * Create a new Streamer
 * @constructor
 * @param {StreamerConfig} config
 * @constructor
 */
function BigQueryStreamer(config) {

	var self = this;

	this.params = {};
	this.params.config = {};
	this.params.service = {};

	//set up config
	this.applyConfig(config);

	//set up service

	//redis client
	var redis_client = config.redis_client || redis.createClient(config.redis_port, config.redis_host);
	if(config.redis_db)
	{
		redis_client.select(config.redis_db);
	}
	redis_client.on('error',function(err){
		self.emit('error', "redis error: " + err)
	});
	this.params.service.promisified_redis_client = Promise.promisifyAll(redis_client);


	//big query client
	bigquery.tables= Promise.promisifyAll(bigquery.tables);
	bigquery.tabledata= Promise.promisifyAll(bigquery.tabledata);
	bigquery.datasets= Promise.promisifyAll(bigquery.datasets);
	this.params.service.promisified_bigquery_client = bigquery;


	//gcs client
	gcs.objects = Promise.promisifyAll(gcs.objects);
	this.params.service.promisified_gcs_client = gcs;

	//google_oauth_client
	this.params.service.google_client = new google.auth.JWT(
		this.params.config.email,
		this.params.config.key_file_pem,
		'key',
		[
			'https://www.googleapis.com/auth/bigquery',
			'https://www.googleapis.com/auth/devstorage.full_control'
		],
		''
	);

}

//Set EventEmitter as super class
require('util').inherits(BigQueryStreamer,require('events').EventEmitter);

/**
 * Start a streamer
 */
BigQueryStreamer.prototype.start = function()
{
	//authorize bigquery client
	var self = this;
	this.params.service.google_client.authorize(function (err, tokens) {
		if (err) {
			self.emit('error', 'google client authorization failed: ' + err);
		} else {
			self.emit('log', 'google client authorized.');
			process.nextTick(function () {

				//start scheduler
				self.scheduler = new Scheduler(self.params);
				self.scheduler.start();
			})
		}
	});
};


/**
 * Apply config to streamer
 * @param {StreamerConfig} config
 */
BigQueryStreamer.prototype.applyConfig = function(config)
{

	var that = this;
	_.forOwn(config,function(value,key){
		that.params.config[key] = value;
	});

	//sender config
	this.params.config.max_idle_time = this.params.config.max_idle_time || 5000;
	this.params.config.min_idle_time = this.params.config.min_idle_time || 0;
	this.params.config.send_batch_size = this.params.config.send_batch_size || 50;


	//scheduler config
	this.params.config.schedule_interval = this.params.config.schedule_interval || 10000;

};



module.exports = BigQueryStreamer;
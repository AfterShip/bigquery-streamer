/**
 * Created by FeikoLai on 30/12/14.
 */
var google = require('googleapis');
var bigquery = google.bigquery('v2');
var gcs = google.storage('v1');
var redis = require("redis");
var Promise = require("bluebird");
var _ = require('lodash');



var Scheduler = require('./scheduler');

function BigQueryStreamer(options) {
	options = options || {};
	var params = _.cloneDeep(options);
	this.params = params;

	//debug mode

	params.debug = options.debug || false;

	//logger config
	params.max_flush_interval = options.max_flush_interval || 5000;
	params.min_flush_interval = options.min_flush_interval || 0;
	params.send_batch_size = options.send_batch_size || 50;

	//big query config

	//auth
	params.email = options.email;
	params.key_file_pem = options.key_file_pem;

	//schema
	params.schemas = options.schemas;


	//settings
	params.project_id = options.project_id;
	params.dataset_id = options.dataset_id;
	params.table_ttl = options.table_ttl;
	params.extra_fields = options.extra_fields;
	params.schedule_interval = options.schedule_interval || 10000;
	params.redis_db = options.redis_db;
	params.redis_namespace = options.redis_namespace;


	//redis client
	var redis_client = options.redis_client || redis.createClient(params.redis_port, params.redis_host);
	if(params.redis_db)
	{
		redis_client.select(params.redis_db);
	}
	redis_client.on('error',function(err){
		console.error(new Date(),"redis error: ",err);
	});
	params.promisified_redis_client = Promise.promisifyAll(redis_client);


	//big query client
	bigquery.tables= Promise.promisifyAll(bigquery.tables);
	bigquery.tabledata= Promise.promisifyAll(bigquery.tabledata);
	bigquery.datasets= Promise.promisifyAll(bigquery.datasets);
	params.promisified_bigquery_client = bigquery;


	//gcs client
	gcs.objects = Promise.promisifyAll(gcs.objects);
	params.promisified_gcs_client = gcs;

	//google_oauth_client
	params.google_client = new google.auth.JWT(
		this.params.email,
		this.params.key_file_pem,
		'key',
		[
			'https://www.googleapis.com/auth/bigquery',
			'https://www.googleapis.com/auth/devstorage.full_control'
		],
		''
	);

}

BigQueryStreamer.prototype.start = function()
{
	//authorize bigquery client
	var that = this;
	this.params.google_client.authorize(function (err, tokens) {
		if (err) {
			console.error('google client authorization failed: ', err);
		} else {
			console.log('google client authorized.');
			process.nextTick(function () {

				//start scheduler
				that.scheduler = new Scheduler(that.params);
				that.scheduler.start();
			})
		}
	});
};

module.exports = BigQueryStreamer;
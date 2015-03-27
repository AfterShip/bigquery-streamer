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

function BigQueryStreamer(config) {


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
		console.error(new Date(),"redis error: ",err);
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

BigQueryStreamer.prototype.start = function()
{
	//authorize bigquery client
	var that = this;
	this.params.service.google_client.authorize(function (err, tokens) {
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

BigQueryStreamer.prototype.applyConfig = function(config)
{

	var that = this;
	_.forOwn(config,function(value,key){
		that.params.config[key] = value;
	});

	//sender config
	this.params.config.max_flush_interval = this.params.config.max_flush_interval || 5000;
	this.params.config.min_flush_interval = this.params.config.min_flush_interval || 0;
	this.params.config.send_batch_size = this.params.config.send_batch_size || 50;


	//scheduler config
	this.params.config.schedule_interval = this.params.config.schedule_interval || 10000;

};

module.exports = BigQueryStreamer;
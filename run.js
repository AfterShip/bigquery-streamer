var Streamer = require('./lib/bigquery-streamer');
var nconf = require('nconf');
var _ = require('lodash');
nconf.argv();


var params = {
	//auth
	email: "398861336159-gkfu27u9qhglfvse3rovjdke5pm9nuvv@developer.gserviceaccount.com",
	key_file_pem: __dirname + '/key/prod.pem',
	key_file_json: __dirname + '/key/prod.json',
	//gcs
	bucket: 'aftership-log-archive',
	//bq
	project_id: "aftership-compute-001",
	dataset_id: "unknown",
	dataset_namespace: "production",
	max_row_size: 16 * 1024,
	redis_db: 100,
	redis_host: "54.175.145.135",
	redis_port: 6379,
	send_batch_size: 100,
	max_flush_interval: 5000,
	redis_namespace: 'logs',
	schemas: require('./schema/aftership-schemas')
};

_.forOwn(params, function (value, key) {
	var nconf_value = nconf.get(key);
	if(nconf_value)
	{
		params[key]= nconf_value;
	}
});

var streamer = new Streamer(params);

streamer.start();


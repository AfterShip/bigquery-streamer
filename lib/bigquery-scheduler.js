/**
 * Created by FeikoLai on 2/1/15.
 */

var Promise = require('bluebird');
var _ = require('lodash');
var Sender = require('./bigquery-sender');
var debug = require('debug-logger');

function Scheduler(params) {

	this.sender_registry = {};

	this.params = params;
}

Scheduler.prototype.start = function () {
	this.scan();
};

Scheduler.prototype.scan = function () {
	var self = this;
	var promisified_redis_client = this.params.service.promisified_redis_client;


	promisified_redis_client.keysAsync(this.params.config.redis_namespace + ':*')
		.then(function (keys) {

			//add new senders
			var current_keys = _.keys(self.sender_registry);
			var new_keys = _.filter(keys, function (k) {
				return !(_.contains(current_keys, k))
			});//can be optimize, use sorted list
			_.forEach(new_keys, function (key) {
				var sender_config = {};
				sender_config.params = self.params;
				sender_config.key = key;
				var sender = new Sender(sender_config);
				self.sender_registry[key] = sender;
				sender.start();
				debug('scheduler').log('added new sender for key:' + key);
			});
		}).then(function () {
			return Promise.delay(self.params.schedule_interval);
		}).catch(function (e) {
			console.error(e);
		})
		.then(function () {
			process.nextTick(function () {
				self.scan();
			});
		});
};

module.exports = Scheduler;
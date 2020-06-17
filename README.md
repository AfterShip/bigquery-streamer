# Bigquery Streamer

This is a streamer to transport Redis records to Google BigQuery using stream insert mode.

## Features
* Fast, lightweight
* Scalable, multiple streamers can play well with each others
* Auto daily table/dataset creation, supports schema, ttl
* Feedback based throttling
* Basic schema validation
* Archive to Google Cloud Storage if payload size exceeds limits
* Auto correct invalid records
* Failure handlings with exponential retries
* Compatible with node.js >= 12

## Get Started

##### Install
```
npm install bigquery-streamer --save
```

##### Start Streamer
```js
var Streamer = require('bigquery-streamer');

var config = {...};
var streamer = new Streamer(config);
streamer.start();
```
## Config
```js
{
	"gcloud": {
		"projectId": "PROJECT_ID",
		"credentials": {
			"client_email": "CLIENT_EMAIL",
			"private_key": "PRIVATE_KEY"
		},
		"autoRetry": true,
		"maxRetries": 10
	},
	"redis": {
		"port": 6379,
		"host": "localhost",
		"db": 1
	},
	"streamer": {
		"max_row_size": 16000,
		"dataset_namespace": "development",
		"table_name_format": "YYYYMMDD_KEY",
		"key_prefix": "logs",
		"scan_interval": 5000,
		"send_batch_size": 100,
		"senders": 64,
		"enable_stat": true,
		"stat_interval": 10000,
		"table_definitions": {
			"general": {
				"v2": {
					"fields": [
						{
							"name": "name",
							"type": "STRING"
						},
						{
							"name": "hostname",
							"type": "STRING"
						},
						{
							"name": "pid",
							"type": "INTEGER"
						},
						{
							"name": "level",
							"type": "INTEGER"
						},
						{
							"name": "msg",
							"type": "STRING"
						},
						{
							"name": "time",
							"type": "TIMESTAMP"
						},
						{
							"name": "v",
							"type": "INTEGER"
						},
						{
							"name": "cargo",
							"type": "STRING"
						},
						{
							"name": "err",
							"type": "RECORD",
							"fields": [
								{
									"name": "name",
									"type": "STRING"
								},
								{
									"name": "message",
									"type": "STRING"
								},
								{
									"name": "stack",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 100
				}
			}
		}
	}
}
```

## Debug
[Debug-logger](https://www.npmjs.com/package/debug-logger) is used. With environment variable `DEBUG=*`, all debug info will direct to `stdout`.



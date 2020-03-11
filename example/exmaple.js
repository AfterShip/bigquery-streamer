var Streamer = require('../lib/streamer');

var streamer = new Streamer({
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
});

streamer.start();
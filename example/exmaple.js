/**
 * Created by FeikoLai on 9/6/15.
 */
var Streamer = require('../lib/streamer');

var streamer = new Streamer({
	gcloud: {
		projectId: "PROJECT_ID",
		credentials: {
			client_email: "EMAIL",
			private_key: "KEY"
		}
	},
	redis: {
		port: 6379,
		host: 'HOST IP',
		db: 15
	},
	streamer: {
		max_row_size: 16000,
		dataset_namespace: "production",
		key_prefix: "logs",
		scan_interval: 5000,
		send_batch_size: 100,
		senders: 16,
		table_definitions: {
			"17track": {
				"v1": {
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
						},
						{
							"name": "req_time",
							"type": "TIMESTAMP"
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "res_time",
							"type": "FLOAT"
						},
						{
							"name": "res_status_code",
							"type": "INTEGER"
						},
						{
							"name": "res_body",
							"type": "STRING"
						},
						{
							"name": "result",
							"type": "BOOLEAN"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"algolia_index": {
				"v1": {
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
						},
						{
							"name": "tracking_number_count",
							"type": "INTEGER"
						},
						{
							"name": "index_count",
							"type": "INTEGER"
						},
						{
							"name": "algolia_response_time",
							"type": "FLOAT"
						},
						{
							"name": "time_range_min",
							"type": "TIMESTAMP"
						},
						{
							"name": "time_range_max",
							"type": "TIMESTAMP"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"algolia_index_delete": {
				"v1": {
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
						},
						{
							"name": "tracking_number_count",
							"type": "INTEGER"
						},
						{
							"name": "algolia_search_response_time",
							"type": "FLOAT"
						},
						{
							"name": "algolia_delete_response_time",
							"type": "FLOAT"
						},
						{
							"name": "batch_older_than",
							"type": "TIMESTAMP"
						},
						{
							"name": "user_id",
							"type": "STRING"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"aws_spot": {
				"v1": {
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
							"name": "create_time",
							"type": "TIMESTAMP"
						},
						{
							"name": "tag_name",
							"type": "string"
						},
						{
							"name": "instance_id",
							"type": "STRING"
						},
						{
							"name": "spot_instance_request_id",
							"type": "string"
						},
						{
							"name": "availability_zone",
							"type": "string"
						},
						{
							"name": "instance_type",
							"type": "string"
						},
						{
							"name": "spot_price",
							"type": "FLOAT"
						},
						{
							"name": "status_code",
							"type": "string"
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 10
				}
			},
			"crawler": {
				"v1": {
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
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "tracking_error",
							"type": "RECORD",
							"fields": [
								{
									"name": "code",
									"type": "INTEGER"
								},
								{
									"name": "message",
									"type": "STRING"
								},
								{
									"name": "details",
									"type": "STRING"
								}
							]
						},
						{
							"name": "checkpoints_count",
							"type": "INTEGER"
						},
						{
							"name": "response_time",
							"type": "FLOAT"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
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
			},
			"crawler_audit": {
				"v1": {
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
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "tracking_error",
							"type": "RECORD",
							"fields": [
								{
									"name": "code",
									"type": "INTEGER"
								},
								{
									"name": "message",
									"type": "STRING"
								},
								{
									"name": "details",
									"type": "STRING"
								}
							]
						},
						{
							"name": "checkpoints_count",
							"type": "INTEGER"
						},
						{
							"name": "response_time",
							"type": "FLOAT"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 15
				},
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
						},
						{
							"name": "tracking_id",
							"type": "STRING"
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "tracking_error",
							"type": "RECORD",
							"fields": [
								{
									"name": "code",
									"type": "INTEGER"
								},
								{
									"name": "message",
									"type": "STRING"
								},
								{
									"name": "details",
									"type": "STRING"
								}
							]
						},
						{
							"name": "checkpoints_count",
							"type": "INTEGER"
						},
						{
							"name": "response_time",
							"type": "FLOAT"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 15
				}
			},
			"crawler_error": {
				"v1": {
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
						},
						{
							"name": "slug",
							"type": "STRING"
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "tracking_error",
							"type": "RECORD",
							"fields": [
								{
									"name": "code",
									"type": "INTEGER"
								},
								{
									"name": "message",
									"type": "STRING"
								},
								{
									"name": "details",
									"type": "STRING"
								}
							]
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 10
				}
			},
			"crawler_17track": {
				"v1": {
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
						},
						{
							"name": "req_time",
							"type": "TIMESTAMP"
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "res_time",
							"type": "FLOAT"
						},
						{
							"name": "res_status_code",
							"type": "INTEGER"
						},
						{
							"name": "res_body",
							"type": "STRING"
						},
						{
							"name": "result",
							"type": "BOOLEAN"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"crawler_monitoring": {
				"v1": {
					"fields": [
						{
							"name": "slug",
							"type": "STRING"
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "response_time",
							"type": "FLOAT"
						},
						{
							"name": "tracking_error_code",
							"type": "INTEGER"
						},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 10
				}
			},
			"crawler_debug": {
				"v1": {
					"fields": [
						{
							"name": "tracking_number",
							"type": "STRING"
						},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 10
				}
			},
			"crawler_ratelimit": {
				"v1": {
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
						},
						{
							"name": "tracking_numbers",
							"type": "STRING"
						},
						{
							"name": "number_of_call_per_job",
							"type": "INTEGER"
						},
						{
							"name": "response_time_ms",
							"type": "FLOAT"
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 10
				}
			},
			"api": {
				"v3": {
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						},
						{
							"name": "remote_ip",
							"type": "STRING"
						},
						{
							"name": "req_header_content_type",
							"type": "STRING"
						},
						{
							"name": "req_header_api_key",
							"type": "STRING"
						},
						{
							"name": "req_url_pathname",
							"type": "STRING"
						},
						{
							"name": "req_url_query",
							"type": "STRING"
						},
						{
							"name": "req_method",
							"type": "STRING"
						},
						{
							"name": "req_body",
							"type": "STRING"
						},
						{
							"name": "res_header_x_ratelimit_limit",
							"type": "INTEGER"
						},
						{
							"name": "res_header_x_ratelimit_remaining",
							"type": "INTEGER"
						},
						{
							"name": "res_header_x_ratelimit_reset",
							"type": "INTEGER"
						},
						{
							"name": "res_header_x_response_time",
							"type": "FLOAT"
						},
						{
							"name": "res_header_etag",
							"type": "STRING"
						},
						{
							"name": "res_status",
							"type": "INTEGER"
						},
						{
							"name": "res_body",
							"type": "STRING"
						},
						{
							"name": "res_content_length",
							"type": "INTEGER"
						},
						{
							"name": "client_close_time",
							"type": "TIMESTAMP"
						}
					],
					"strippable_fields": [
						"msg",
						"req_body",
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"www": {
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						},
						{
							"name": "remote_ip",
							"type": "STRING"
						},
						{
							"name": "req_url_pathname",
							"type": "STRING"
						},
						{
							"name": "req_url_query",
							"type": "STRING"
						},
						{
							"name": "req_method",
							"type": "STRING"
						},
						{
							"name": "res_header_x_response_time",
							"type": "FLOAT"
						},
						{
							"name": "req_header_host",
							"type": "STRING"
						},
						{
							"name": "res_status",
							"type": "INTEGER"
						},
						{
							"name": "client_close_time",
							"type": "TIMESTAMP"
						},
						{
							"name": "req_protocol",
							"type": "STRING"
						}
					],
					"strippable_fields": [
						"msg",
						"req_body",
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"button": {
				"v1": {
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						},
						{
							"name": "remote_ip",
							"type": "STRING"
						},
						{
							"name": "req_url_pathname",
							"type": "STRING"
						},
						{
							"name": "req_url_query",
							"type": "STRING"
						},
						{
							"name": "req_header_referer",
							"type": "STRING"
						},
						{
							"name": "req_method",
							"type": "STRING"
						},
						{
							"name": "res_header_x_response_time",
							"type": "FLOAT"
						},
						{
							"name": "res_status",
							"type": "INTEGER"
						},
						{
							"name": "client_close_time",
							"type": "TIMESTAMP"
						}
					],
					"strippable_fields": [
						"msg",
						"req_body",
						"res_body",
						"cargo"
					],
					"ttl": 100
				}
			},
			"connector": {
				"v1": {
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						},
						{
							"name": "document_id",
							"type": "STRING"
						},
						{
							"name": "error_message",
							"type": "STRING"
						},
						{
							"name": "error_number",
							"type": "INTEGER"
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 100
				}
			},
			"connector_debug": {
				"v1": {
					"fields": [
						{
							"name": "job_id",
							"type": "STRING"
						},
						{
							"name": "document_id",
							"type": "STRING"
						},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 10
				}
			},
			"notification": {
				"v1": {
					"fields": [
						{
							"name": "notification_type",
							"type": "STRING"
						},
						{
							"name": "from",
							"type": "STRING"
						},
						{
							"name": "to",
							"type": "STRING"
						},
						{
							"name": "tag",
							"type": "STRING"
						},
						{
							"name": "subject",
							"type": "STRING"
						},
						{
							"name": "content",
							"type": "STRING"
						},
						{
							"name": "sender",
							"type": "STRING"
						},
						{
							"name": "sent_id",
							"type": "STRING"
						},
						{
							"name": "email_events",
							"type": "STRING"
						},
						{
							"name": "sms_events",
							"type": "STRING"
						},
						{
							"name": "webhook_events",
							"type": "STRING"
						},
						{
							"name": "sent_at",
							"type": "TIMESTAMP"
						},
						{
							"name": "delivered_at",
							"type": "TIMESTAMP"
						},
						{
							"name": "read_at",
							"type": "TIMESTAMP"
						},
						{
							"name": "used_credit",
							"type": "FLOAT"
						},
						{
							"name": "job_id",
							"type": "INTEGER"
						},
						{
							"name": "sms_id",
							"type": "STRING"
						},
						{
							"name": "user_id",
							"type": "STRING"
						},
						{
							"name": "tracking_id",
							"type": "STRING"
						},
						{
							"name": "notification_id",
							"type": "STRING"
						},
						{
							"name": "active",
							"type": "BOOLEAN"
						},
						{
							"name": "retry_count",
							"type": "INTEGER"
						},
						{
							"name": "req_start_time",
							"type": "TIMESTAMP"
						},
						{
							"name": "res_time",
							"type": "INTEGER"
						},
						{
							"name": "res_status_code",
							"type": "INTEGER"
						},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"content",
						"cargo"
					],
					"ttl": 100
				},
				"v2": {
					"fields": [
						{
							"name": "notification_type",
							"type": "STRING"
						},
						{
							"name": "from",
							"type": "STRING"
						},
						{
							"name": "to",
							"type": "STRING"
						},
						{
							"name": "tag",
							"type": "STRING"
						},
						{
							"name": "subject",
							"type": "STRING"
						},
						{
							"name": "content",
							"type": "STRING"
						},
						{
							"name": "sender",
							"type": "STRING"
						},
						{
							"name": "sent_id",
							"type": "STRING"
						},
						{
							"name": "email_events",
							"type": "STRING"
						},
						{
							"name": "sms_events",
							"type": "STRING"
						},
						{
							"name": "webhook_events",
							"type": "STRING"
						},
						{
							"name": "sent_at",
							"type": "TIMESTAMP"
						},
						{
							"name": "delivered_at",
							"type": "TIMESTAMP"
						},
						{
							"name": "read_at",
							"type": "TIMESTAMP"
						},
						{
							"name": "used_credit",
							"type": "FLOAT"
						},
						{
							"name": "job_id",
							"type": "INTEGER"
						},
						{
							"name": "sms_id",
							"type": "STRING"
						},
						{
							"name": "user_id",
							"type": "STRING"
						},
						{
							"name": "tracking_id",
							"type": "STRING"
						},
						{
							"name": "notification_id",
							"type": "STRING"
						},
						{
							"name": "active",
							"type": "BOOLEAN"
						},
						{
							"name": "retry_count",
							"type": "INTEGER"
						},
						{
							"name": "req_start_time",
							"type": "TIMESTAMP"
						},
						{
							"name": "res_time",
							"type": "INTEGER"
						},
						{
							"name": "res_status_code",
							"type": "INTEGER"
						},
						{
							"name": "created_at",
							"type": "TIMESTAMP"
						},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"content",
						"cargo"
					],
					"ttl": 100
				}
			},
			"general": {
				"v1": {
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
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
				},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
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
			},
			"monitoring": {
				"v1": {
					"fields": [
						{
							"name": "slug",
							"type": "STRING"
						},
						{
							"name": "tracking_number",
							"type": "STRING"
						},
						{
							"name": "response_time",
							"type": "FLOAT"
						},
						{
							"name": "tracking_error_code",
							"type": "INTEGER"
						},
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
						},
						{
							"name": "archive",
							"type": "RECORD",
							"fields": [
								{
									"name": "type",
									"type": "STRING"
								},
								{
									"name": "ref1",
									"type": "STRING"
								},
								{
									"name": "ref2",
									"type": "STRING"
								},
								{
									"name": "ref3",
									"type": "STRING"
								}
							]
						}
					],
					"strippable_fields": [
						"msg",
						"cargo"
					],
					"ttl": 35
				}
			}
		}
	}

});

streamer.start();
const Streamer = require('../');

const streamer = new Streamer({
	gcloud: {
		credentials: {
		},
		projectId: 'aftership-log',
		autoRetry: true,
		maxRetries: 10
	},
	redis: {
		port: 6379,
		host: 'localhost',
		db: 5
	},
	streamer: {
		max_row_size: 16000,
		dataset_namespace: 'development',
		key_prefix: 'logs',
		scan_interval: 5000,
		send_batch_size: 100,
		senders: 64,
		enable_stat: true,
		stat_interval: 1000,
		table_definitions: {
			www: {
				v2: {
					'fields': [
						{
							'name': 'name',
							'type': 'STRING'
						},
						{
							'name': 'hostname',
							'type': 'STRING'
						},
						{
							'name': 'pid',
							'type': 'INTEGER'
						},
						{
							'name': 'level',
							'type': 'INTEGER'
						},
						{
							'name': 'msg',
							'type': 'STRING'
						},
						{
							'name': 'time',
							'type': 'TIMESTAMP'
						},
						{
							'name': 'v',
							'type': 'INTEGER'
						},
						{
							'name': 'cargo',
							'type': 'STRING'
						},
						{
							'name': 'err',
							'type': 'RECORD',
							'fields': [
								{
									'name': 'name',
									'type': 'STRING'
								},
								{
									'name': 'message',
									'type': 'STRING'
								},
								{
									'name': 'stack',
									'type': 'STRING'
								}
							]
						},
						{
							'name': 'remote_ip',
							'type': 'STRING'
						},
						{
							'name': 'req_protocol',
							'type': 'STRING'
						},
						{
							'name': 'req_method',
							'type': 'STRING'
						},
						{
							'name': 'req_header_host',
							'type': 'STRING'
						},
						{
							'name': 'req_url_pathname',
							'type': 'STRING'
						},
						{
							'name': 'req_url_query',
							'type': 'STRING'
						},
						{
							'name': 'req_body',
							'type': 'STRING'
						},
						{
							'name': 'req_user_agent',
							'type': 'STRING'
						},
						{
							'name': 'res_header_x_response_time',
							'type': 'FLOAT'
						},
						{
							'name': 'res_status',
							'type': 'INTEGER'
						},
						{
							'name': 'res_content_length',
							'type': 'INTEGER'
						},
						{
							'name': 'client_close_time',
							'type': 'TIMESTAMP'
						}
					],
					'strippable_fields': [
						'msg',
						'req_body',
						'res_body',
						'cargo'
					],
					'ttl': 100
				}
			}
		}
	}
});

streamer.start();
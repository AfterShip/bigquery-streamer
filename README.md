# Redis to BigQuery streamer

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
* Compatible with node.js > 0.10 and io.js > 1.0



## Get Started

##### Install
```
npm install bigquery-streamer
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
/**
 * Bigquery Streamer Config
 * @typedef {object} StreamerConfig
 *
 * redis
 * @property {object} [redis_client] - an redis_client to fetch data, if this is provided, redis_port and redis_host would be ignored.
 * @property {string} [redis_host] - address of the redis host to fetch data.
 * @property {number} [redis_port] - port of the redis host to fetch data.
 * @property {number} [redis_db] -  the db of redis to where streamer fetch data from.
 * @property {string} redis_namespace - namespace of keys to query
 *
 * scheduler
 * @property {number} schedule_interval - the interval for scheduler to scan new keys
 *
 * sender
 * @property {number} [max_idle_time = 10000] - Max idle time in millisecond for a sender to wait before next fetch
 * @property {number} [min_idle_time = 0] - Min idle time in millisecond for a sender to wait before next fetch
 * @property {number} [send_batch_size = 100] - the batch size of every BigQuery stream insert
 * @property {number} max_row_size - record over this size will be trimmed and archived to GCS
 * @property {TableDefinition} table_definitions
 *
 * sender|retry
 * @property {number} [retry_timeout = 300000] - retry timeout ref: https://github.com/jut-io/bluebird-retry/
 * @property {number} [retry_interval = 250] - retry interval ref: https://github.com/jut-io/bluebird-retry/
 * @property {number} [retry_backoff = 2] - retry backoff ref: https://github.com/jut-io/bluebird-retry/
 * @property {number} [retry_max_tries = 10] - retry max tries ref: https://github.com/jut-io/bluebird-retry/
 *
 * google cloud
 * @property {string} email - Google api authentication email
 * @property {string} bucket - bucket in Google Cloud Storage for archive
 * @property {string} project_id - project_id of destination BigQuery
 * @property {string} dataset_namespace - the (namespace) prefix of auto created datasets
 * @property {string} key_file_pem - file path of google auth private key pem file
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
```
ref

## Update JSDoc
```
grunt doc

```

## Debug
[Debug-logger](https://www.npmjs.com/package/debug-logger) is used. With environment variable `DEBUG=*`, all debug info will direct to `stdout`.

## Design
WIP




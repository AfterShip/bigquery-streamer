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
npm install redis-bigquery
```

##### Start Streamer
```js
var Streamer = require('bigquery-streamer');

var config = {...};
var streamer = new Streamer(config);
streamer.start();
```
## Config

ref

## Debug
[Debug-logger](https://www.npmjs.com/package/debug-logger) is used. With environment variable `DEBUG=*`, all debug info will direct to `stdout`.

## Design
WIP




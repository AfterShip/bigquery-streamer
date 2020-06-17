const Util = require('./util');
const DebugLogger = require('debug-logger')('StatReporter');

class StatReporter {
	constructor(delayDuration) {
		this.stat = {};
		this.delayDuration = delayDuration;
	}

	add(key) {
		if (!this.stat[key]) {
			this.stat[key] = 1;
		} else {
			this.stat[key] = this.stat[key] + 1
		}
	}

	async start() {
		while (true) {
			await Util.delay(this.delayDuration);
			let count = 0;

			for (const jobCount of Object.values(this.stat)) {
				count += jobCount;
			}

			DebugLogger.info(`${count} jobs dispatched in ${this.delayDuration}ms`);
			this.stat = {};
		}
	}
}

module.exports = StatReporter;
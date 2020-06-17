async function delay(delayDuration) {
	await (new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, delayDuration);
	}))
}

async function retry(inputFunction, options = {}) {
	options = options || {};
	const retries = ('retries' in options) ? options.retries : 6;
	let interval = ('interval' in options) ? options.interval : 1000;
	const factor = ('factor' in options) ? options.factor : 2;
	let attempts = retries + 1;

	while (true) {
		try {
			return await inputFunction();
		} catch (e) {
			attempts--;
			if (!attempts){
				throw e;
			}
			await delay(interval);
			interval = interval * factor;
		}
	}
}

module.exports = {
	delay,
	retry
};

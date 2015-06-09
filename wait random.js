(function(ext) {
	ext._shutdown = function() {};

	ext._getStatus = function() {
		return {status:2, msg: 'Ready'};
	};

	ext.wait_random = function(callback) {
		wait = Math.random();
		console.log('Waiting for ' + wait + ' seconds');
		window.setTimeout(function() {
			callback();
		}, wait*1000);
	};

	var descriptor = {
		blocks: [
			['w', 'wait for random time', 'wait_random']
		]
	};

	ScratchExtensions.register('Sample extension', descriptor, ext);
})({});

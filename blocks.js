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

	ext.power = function(base, exponent) {
		return Math.pow(base,exponent);	
	};

	var descriptor = {
		blocks: [
			 ['w', 'wait for random time', 'wait_random'],
			 ['r', '%n ^ %n', 'power', 2, 3],
		]
	};

	ScratchExtensions.register('Sample extension', descriptor, ext);
})({});

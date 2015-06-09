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

	ext.get_temp = function(location, callback) 
	{
		$.ajax(
		{
			url: 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&units=imperial',
			dataType: 'json',
			success: function(weather_data) 
			{
				temperature = weather_data['main']['temp'];
				callback(temperature);	
		        }
		});
	};

	var descriptor = {
		blocks: [
			 ['w', 'wait for random time', 'wait_random'],
			 ['r', '%n ^ %n', 'power', 2, 3],
			 ['R', 'current temperature in city %s', 'get_temp', 'Boston, MA'],
		]
	};

	ScratchExtensions.register('Sample extension', descriptor, ext);
})({});

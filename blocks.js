(function(ext) 
{
	ext._shutdown = function() {};

	ext._getStatus = function() 
	{
		return {status:2, msg: 'Ready'};
	};

	ext.wait_random = function(callback) 
	{
		wait = Math.random();
		console.log('Waiting for ' + wait + ' seconds');
		window.setTimeout(function() { callback(); }, wait*1000);
	};

	ext.power = function(base, exponent) 
	{
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

	ext.set_alarm = function(time) 
	{
		window.setTimeout(function() {alarm_went_off = true;}, time * 1000);		
	};

	ext.when_alarm = function()
	{
		if (alarm_went_off === true)
		{
			alarm_went_off = false;
			return true;
		}
		return false;
	};

	var descriptor = {
		blocks: [
			 ['w', 'wait for random time', 'wait_random'],
			 ['r', '%n ^ %n', 'power', 2, 3],
			 ['R', 'current temperature in city %s', 'get_temp', 'Leeds, UK'],
			 ['', 'run alarm after %n seconds', 'set_alarm', '2'],
			 ['h', 'when alarm goes off', 'when_alarm'],
			]
	};

	ScratchExtensions.register('Sample extension', descriptor, ext);
})({});

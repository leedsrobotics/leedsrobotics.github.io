(function(ext) 
{
	ext._shutdown = function() {};

	ext._getStatus = function() 
	{
		return {status:2, msg: 'Ready'};
	};
	
	var poller = null;
        ext._deviceConnected = function(dev) {
                if(device) return;

                device = dev;
                device.open();

                poller = setInterval(function() {
                        rawData = device.read();
                }, 20);
        };
	
	ext._deviceRemoved = function(dev) {
                if(device != dev) return;
                if(poller) poller = clearInterval(poller);
                device = null;
        };
	
	ext._shutdown = function() {
                if(poller) poller = clearInterval(poller);
                if(device) device.close();
                device = null;
        }

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

        var hid_info = {type: 'hid', vendor: 0x192f, product: 0x0416};
	ScratchExtensions.register('Practise Extensions', descriptor, ext, hid_info);
})({});

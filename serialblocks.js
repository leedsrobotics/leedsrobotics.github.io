(function(ext) 
{
	ext._getStatus = function() 
	{
	        /** Reports extension status */
		return {status:2, msg: 'Ready'};
	};
	
	var potentialDevices = [];
        ext._deviceConnected = function(dev) 
        {
                potentialDevices.push(dev);
                
                if(!device)
                {
                        tryNextDevice();
                }
        };
	
	ext._deviceRemoved = function(dev) 
	{
	        /**
	         * Closes device connection on device removal
	         */
	         
                if(device != dev) return;
                if(poller) poller = clearInterval(poller);
                device = null;
        };
	
	ext._shutdown = function() {
	        /**
	         * Shuts down connected devices on extension shutdown
	         */
	         
                if(poller) poller = clearInterval(poller);
                if(device) device.close();
                device = null;
        }

	ext.wait_random = function(callback) 
	{
	        /**
	         * Waits a random amount of time
	         */
	         
		wait = Math.random();
		console.log('Waiting for ' + wait + ' seconds');
		window.setTimeout(function() { callback(); }, wait*1000);
	};

	ext.power = function(base, exponent) 
	{
	        /**
	         * Multiplies a given number to a given power
	         */
	         
		return Math.pow(base,exponent);	
	};

	ext.get_temp = function(location, callback) 
	{
	        /**
	         * Collects weather data from openweather.org for a given location, returning the temperature.
	         */
	         
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
	        /**
	         * Sets the alarm time
	         */
	         
		window.setTimeout(function() {alarm_went_off = true;}, time * 1000);		
	};

        
	ext.when_alarm = function()
	{
	        /**
	         * Activates the alarm hat block after a given time
	         * (specified in the set_alarm block function).
	         */
	        
		if (alarm_went_off === true)
		{
			alarm_went_off = false;
			return true;
		}
		return false;
	};

        // Registers block types, names and corresponding 
	var descriptor = {
		blocks: [
			 ['w', 'wait for random time', 'wait_random'],
			 ['r', '%n ^ %n', 'power', 2, 3],
			 ['R', 'current temperature in city %s', 'get_temp', 'Leeds, UK'],
			 ['', 'run alarm after %n seconds', 'set_alarm', '2'],
			 ['h', 'when alarm goes off', 'when_alarm'],
			]
	};

        
        // Creates object containing serial info
        var serial_info = {type: 'serial'};
        
        // Register Extension
	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

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
        
        var poller = null;
  	var watchdog = null;
  	function tryNextDevice() 
  	{
		device = potentialDevices.shift();
    		if (!device) return;

    		device.open({ stopBits: 0, bitRate: 57600, ctsFlowControl: 0 });
    		console.log('Attempting connection with ' + device.id);
    		device.set_receive_handler(function(data) 
    		{
      			var inputData = new Uint8Array(data);
      			processInput(inputData);
    		});

    		poller = setInterval(function() { queryFirmware(); }, 1000);
    		
    		watchdog = setTimeout(function() 
    		{
      			clearInterval(poller);
      			poller = null;
      			device.set_receive_handler(null);
      			device.close();
      			device = null;
      			tryNextDevice();
    		}, 5000);
  	};
  	
  	ext.serialState = function()
  	{
  		if(device) {
  			alert("Connection Confirmed!");
  		
  		} else {
  			alert("No connection found.");
  		}
  	}
	
	ext._shutdown = function() {
	        /**
	         * Shuts down connected devices on extension shutdown
	         */
        }

        // Registers block types, names and corresponding 
	var descriptor = {
		blocks: [ ['', 'Print Serial State', 'serialState'] ]
	};

        
        // Creates object containing serial info
        var serial_info = {type: 'serial'};
        
        // Register Extension
	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

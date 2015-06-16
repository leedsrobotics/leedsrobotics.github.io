(function(ext) 
{
	var device = null;
	var rawData = null;
	
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
                        console.log("Trying");
                }
        };
  	
  	var poller = null;
    	var watchdog = null;
	function tryNextDevice() {
        	// If potentialDevices is empty, device will be undefined.
        	// That will get us back here next time a device is connected.
        	device = potentialDevices.shift();
        	if (!device) return;

		device.open({ stopBits: 1, bitRate: 9600, ctsFlowControl: 1 });
        	device.set_receive_handler(function(data) {
            		if(!rawData || rawData.byteLength == 18) rawData = new Uint8Array(data);
            		else rawData = appendBuffer(rawData, data);

            		if(rawData.byteLength >= 18) {
                		processData();
            		}
        	});

        	var pingCmd = new Uint8Array(1);
        	pingCmd[0] = 1;
        	poller = setInterval(function() {
            		device.send(pingCmd.buffer);
        	}, 50);
        	watchdog = setTimeout(function() {
            		// This device didn't get good data in time, so give up on it. Clean up and then move on.
            		// If we get good data then we'll terminate this watchdog.
            		clearInterval(poller);
            		poller = null;
            		device.set_receive_handler(null);
            		device.close();
            		device = null;
            		tryNextDevice();
        	}, 250);
    	};
  	
  	ext.serialState = function()
  	{
  		if(device === null)
  		{
  			alert("No Device Detected");
  		}
  		else
  		{
  			alert("Something has been found!");
  		}
  	};
	
	ext._shutdown = function() {
	        /**
	         * Shuts down connected devices on extension shutdown
	         */
        };

        // Registers block types, names and corresponding 
	var descriptor = {
		blocks: [ ['', 'Print Serial State', 'serialState'] ]
	};

        
        // Creates object containing serial info
        var serial_info = {type: 'serial'};
        
        // Register Extension
	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

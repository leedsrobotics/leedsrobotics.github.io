(function(ext) 
{
	var device = null;
	var rawData = null;
	var potentialDevices = [];
	
	ext._getStatus = function() 
	{
	        /** Reports extension status */
		return {status:2, msg: 'Ready'};
	};
	
	function appendBuffer( buffer1, buffer2 ) {
        	var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
        	tmp.set( new Uint8Array( buffer1 ), 0 );
        	tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
        	return tmp.buffer;
    	}
	
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
                		alert("IT MOVES!");
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
	

        ext._deviceConnected = function(dev) 
        {
                potentialDevices.push(dev);
                
                if(!device)
                {
                        tryNextDevice();
                }
        };
  	
  	
  	
  	ext.serialState = function()
  	{
  		if(device === null)
  		{
  			alert("No Device Detected");
  		}
  		else
  		{
  			alert("Serial Device Connected!");
  			console.log(device.constructor.name);
  		}
  	};
	
	ext._deviceRemoved = function(dev) {
    		//if(device != dev) return;
    		//if(poller) poller = clearInterval(poller);
    		console.log("Device should be null");
    		//device = null;
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

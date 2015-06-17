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
		console.log("aaaa");
		device.open({ stopBits: 1, bitRate: 9600, ctsFlowControl: 1 });
		console.log(device);
		var msg = new Uint8Array(1);
        	msg[0] = 1;
		for(var i =0; i <1000; i++){
			console.log(i);
			device.send(msg.buffer);
			setInterval(function () {}, 500);
		}
        	device.set_receive_handler(function(data) {
        		alert("Receiving Data ...")
        		for(var z = 0; z < data.byteLength; z++)
        		{
        			console.log(data[z]);
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
  	
  	ext.dataReceived = function()
  	{
  		var buffer = new ArrayBuffer(3);
  		buffer[0] = "@";
  		buffer[1] = "i";
  		buffer[2] = "d";
  		device.send(buffer);
  		
  		if(rawData === null)
  		{
  			console.log("rawData is null");
  		}
  		else if(rawData.byteLength == 0)
  		{
  			console.log("rawData is empty");
  		}
  		else
  		{
  			console.log("rawData has data!");
  			for(var i = 0; i < rawData.byteLength; i++)
  			{
  				console.log(rawData[i]);
  			}
  		}
  	}
	
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
		blocks: [ ['', 'Print Serial State', 'serialState'],
			  ['', 'Check data Receival', 'dataReceived']]
	};

        
        // Creates object containing serial info
        var serial_info = {type: 'serial'};
        
        // Register Extension
	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

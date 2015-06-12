(function(ext) 
{
	ext._getStatus = function() 
	{
	        /** Reports extension status */
		return {status:2, msg: 'Ready'};
	};
	
	var poller = null;
        ext._deviceConnected = function(dev) {
                /**
                 * Opens device connection, collecting device data over repeated
                 * intervals
                 */
                 
                if(device) return;

                device = dev;
                device.open();

                poller = setInterval(function() {
                        rawData = device.read();
                }, 20);
        };
	
	ext._deviceRemoved = function(dev) {
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

        // Registers block types, names and corresponding 
	var descriptor = {
		blocks: []
	};

        
        // Creates object containing device info
        var hid_info = {type: 'hid', vendor: 0x045e, product: 0x00cb};
        
        // Register Extension
	ScratchExtensions.register('Practise Extensions', descriptor, ext, hid_info);
})({});

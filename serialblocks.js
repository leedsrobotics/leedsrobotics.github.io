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
                alert("CONNECTED");
        };
	
	ext._shutdown = function() {
	        /**
	         * Shuts down connected devices on extension shutdown
	         */
        }

        // Registers block types, names and corresponding 
	var descriptor = {
		blocks: []
	};

        
        // Creates object containing serial info
        var serial_info = {type: 'serial'};
        
        // Register Extension
	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

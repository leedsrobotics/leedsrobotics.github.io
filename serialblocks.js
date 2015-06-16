(function(ext) 
{
	var device = null;
	
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

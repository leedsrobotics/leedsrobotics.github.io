(function(ext) 
{
	var device;
	
  	ext._getStatus = function() 
  	{
    		return {status:2, msg: 'Ready'};
  	};
	
	var potentialDevices = [];
    	ext._deviceConnected = function(dev) {
        	potentialDevices.push(dev);

        	if (!device) {
            	tryNextDevice();
        	}
   	}
   
   	function tryNextDevice() 
   	{
        	device = potentialDevices.shift();
        	if (!device) return;

        	device.open({ stopBits: 0, bitRate: 9600, ctsFlowControl: 0 });
        	device.set_receive_handler(function(data) {
        		console.log("Receiving Data...");
        		console.log(data[0]);
        	});
   	};
  	
  	
  	
  	ext.serialState = function()
  	{
    		if(device === null)
  		{
  	  		alert("No Device Detected");
  		}
  		else
  		{
  	  		alert("Serial Device Connected! " + device.id.toString());
  	  		console.log(device.constructor.name);
  		}
  	};
  	
  	ext.sendAtSymbol = function()
  	{
    		var view = new Uint8Array(1);
    		view[0] = 64;
    		device.send(view.buffer);
  	}
  	
  	ext.idRequest = function()
  	{
  		var commandLeft = "@id";
  		
  		var view = new Uint8Array(3);
  		
  		for(var x = 0; x < commandLeft.length; x++)
  		{
  			view[x] = commandLeft.charCodeAt(x);
  		}
  		
  		device.send(view.buffer);
  	}
  	
  	ext.turning = function(direction)
  	{
  		console.log(direction);
  		var directionCommand = '@m00';
  		if(direction == 'left')
  		{
  			directionCommand = "@m0~";
  		}
  		else if(direction == 'right')
  		{
  			directionCommand = "@m~0";
  		}
  		console.log(directionCommand);
  		var view = new Uint8Array(4);
  		
  		for(var x = 0; x < directionCommand.length; x++)
  		{
  			view[x] = directionCommand.charCodeAt(x);
  		}
  		
  		device.send(view.buffer);
  	}
	
	ext._shutdown = function() 
	{
	        /**
	         * Shuts down connected devices on extension shutdown
	         */
  	};

  	// Registers block types, names and corresponding 
	var descriptor = {
		blocks: [ ['', 'Print Serial State', 'serialState'],
			  ['', 'Request ID', 'idRequest'],
			  ['', 'Send At Symbol', 'sendAtSymbol'],
			  [' ', 'Turn %m.directions', 'turning', 'left'],
			],
		menus:  {
				directions: ['left', 'right']
		        }
	};

        
  	var serial_info = {type: 'serial'};
        
  	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

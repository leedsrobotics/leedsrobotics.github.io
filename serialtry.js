(function(ext) 
{
	var device;
	var dataView = null;
	
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
        		dataView = new Uint8Array(data);
        		//console.log(String.fromCharCode(dataView[0]));
        		for(var x = 0; x < dataView.length; x++)
        		{
        			console.log(String.fromCharCode(dataView[x]));	
        		}
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

  	
  	ext.turning = function(direction, speed)
  	{
  		var directionCommand = '@m';
  		var view = new Uint8Array(4);
  		
  		view[0] = directionCommand.charCodeAt(0);
  		view[1] = directionCommand.charCodeAt(1);
  		view[2] = 0x00;
  		view[3] = 0x00;
  		
  		if(direction == 'left')
  		{
  			view[2] = 0x80|speed;
  			view[3] = speed;
  		}
  		else if(direction == 'right')
  		{
  			view[2] = speed;
  			view[3] = 0x80|speed;
  		}
  		
  		device.send(view.buffer);
  	}
  	
  	ext.stopMotors = function()
  	{
  		var directionCommand = '@m';
  		var view = new Uint8Array(4);
  		
  		view[0] = directionCommand.charCodeAt(0);
  		view[1] = directionCommand.charCodeAt(1);
  		view[2] = 0x00;
  		view[3] = 0x00;
  		
  		
  		
  		device.send(view.buffer);
  	}
  	
  	ext.goForwards = function(speed)
  	{
  		var directionCommand = '@m';
  		var view = new Uint8Array(4);
  		
  		view[0] = directionCommand.charCodeAt(0);
  		view[1] = directionCommand.charCodeAt(1);
  		view[2] = speed;
  		view[3] = speed;
  		
  		device.send(view.buffer);
  	}
	
	ext.goBackwards = function(speed)
  	{
  		var directionCommand = '@m';
  		var view = new Uint8Array(4);
  		
  		view[0] = directionCommand.charCodeAt(0);
  		view[1] = directionCommand.charCodeAt(1);
  		view[2] = 0x80|speed;
  		view[3] = 0x80|speed;
  		
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
			  ['', 'Go Forwards at speed %n', 'goForwards', 100],
			  ['', 'Go Backwards at speed %n', 'goBackwards', 100],
			  [' ', 'Turn %m.directions at speed %n', 'turning', 'left', 100],
			  ['', 'Stop Motors', 'stopMotors'],
			],
		menus:  {
				directions: ['left', 'right']
		        }
	};

        
  	var serial_info = {type: 'serial'};
        
  	ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

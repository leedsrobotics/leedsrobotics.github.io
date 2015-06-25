(function(ext) 
{
	var device; // Declares undefined device
	var dataView = null; // View to contain received data
	var state = 'still'; // Current state of device
	
	/**
	 * Return status of the extension
	 */
  	ext._getStatus = function() 
  	{
    		return {status:2, msg: 'Ready'};
  	};
	
	
	/**
	 * Checks if newly connected devices are viable (runs whenever new device is connected)
	 */
	var potentialDevices = [];
    	ext._deviceConnected = function(dev) {
        	potentialDevices.push(dev); // Add new device to the list of potential devices

		// If no device is currently set, try another device
        	if (!device) {
            	tryNextDevice();
        	}
   	}
   
   	
   	/**
   	 * Checks if a compatible device is connected, opening a connection if it is and specifies data received
   	 * should be printed in a readable format
   	 */
   	function tryNextDevice() 
   	{
   		device = potentialDevices.shift(); // Set device to the next available device
        	if (!device) return; // If there was no device available, return

        	device.open({ stopBits: 0, bitRate: 9600, ctsFlowControl: 0 }); // Opens connection
        	
        	// When data is received from device, convert the data to a readable format and print to console
        	device.set_receive_handler(function(data) {
        		dataView = new Uint8Array(data);
        		for(var x = 0; x < dataView.length; x++)
        		{
        			console.log(dataView[x]);
        			console.log(String.fromCharCode(dataView[x]));
        		}
        	});
   	};
  	
  	
  	/**
  	 * Declares whether a device is connected, printing out the port its connected through if it is and
  	 * its constructor name.
  	 */
  	ext.serialState = function()
  	{
  		console.log("checking ...");
  		// If no device detected, alert the user
    		if(device === null)
  		{
  			console.log("No device");
  	  		alert("No Device Detected");
  		}
  		
  		// If device found, alert the user
  		else
  		{
  	  		alert("Serial Device Connected! " + device.id.toString());
  	  		console.log(device.constructor.name);
  		}
  	};
  	
  	
  	/**
  	 * Sends ID request to the device
  	 */
  	ext.idRequest = function()
  	{
  		var idCommand = "@id"; // Request ID command definition
  		var view = new Uint8Array(3); // View to contain the command being sent
  		
  		// Fill view with the commands individual bits
  		for(var x = 0; x < idCommand.length; x++)
  		{
  			view[x] = idCommand.charCodeAt(x);
  		}
  		
  		device.send(view.buffer); // Send command
  	}
  	
  	
  	/**
  	 * Sends ID request to the device
  	 */
  	ext.pinStatus = function(pin)
  	{
  		var pinCommand = "@ar" + pin; // Request ID command definition
  		var view = new Uint8Array(5); // View to contain the command being sent
  		
  		// Fill view with the commands individual bits
  		for(var x = 0; x < pinCommand.length; x++)
  		{
  			view[x] = pinCommand.charCodeAt(x);
  		}
  		
  		device.send(view.buffer); // Send command
  	}

  	
  	/**
  	 * Turns the device on the spot in a specified direction
  	 */
  	ext.turning = function(direction, speed)
  	{
  		if(state != direction && speed <= 100 && speed >= 0)
  		{
  			var directionCommand = '@m'; // Motor command definition
  			var view = new Uint8Array(4); // View to contain the command being sent
  		
  			// Declare motor command
  			view[0] = directionCommand.charCodeAt(0);
  			view[1] = directionCommand.charCodeAt(1);
  		
  			// Set right motor full forward and left motor full backwards if left
  			if(direction == 'left')
  			{
  				view[2] = 0x80|speed;
  				view[3] = speed;
  			}
  		
  			// Set left motor full forward and right motor full backwards if left
  			else if(direction == 'right')
  			{
  				view[2] = speed;
  				view[3] = 0x80|speed;
  			}
  		
  		
  			device.send(view.buffer); // Send command
  			state = direction;
  		}
  	}
  	
  	
  	/**
  	 * Stops the motors from spinning
  	 */
  	ext.stopMotors = function()
  	{
  		if(state != 'still')
  		{
  			var directionCommand = '@m'; // Motor command definition
  			var view = new Uint8Array(4); // View to contain the command being sent
  		
  			// Declare motor command
  			view[0] = directionCommand.charCodeAt(0);
  			view[1] = directionCommand.charCodeAt(1);
  		
  			view[2] = 0x00; // Left motor speed (stops motor)
  			view[3] = 0x00; // Right motor speed (stops motor)
  		
  			device.send(view.buffer); // Send command
  			state = 'still';
  		}
  	}
  	
  	
  	/**
	 * Sets motors to spin either forwards or backwards at a specified speed
	 */
  	ext.goForwardsOrBackwards = function(direction, speed)
  	{
  		if(state != direction && speed <= 100 && speed >= 0)
  		{
  			var directionCommand = '@m'; // Motor command definition
  			var view = new Uint8Array(4); // View to contain the command being sent
  		
  			// Declare motor command
  			view[0] = directionCommand.charCodeAt(0);
  			view[1] = directionCommand.charCodeAt(1);
  		
  			if(direction == 'forwards')
  			{
  				view[2] = speed; // Left motor speed
  				view[3] = speed; // Right motor speed
  			}
  			else if(direction == 'backwards')
  			{
  				view[2] = 0x80|speed; // Left motor speed (reversed)
  				view[3] = 0x80|speed; // Right motor speed (reversed)
  			}
  			
  			device.send(view.buffer); // Send command
  			state = 'forwards';
  		}
  	}
	
	
	/**
	 * Processes that run on extension shutdown
	 */
	ext._shutdown = function(){};


  	// Registers block types, names and corresponding procedures
	var descriptor = {
		blocks: [ ['', 'Print Serial State', 'serialState'],
			  ['', 'Request ID', 'idRequest'],
			  ['', 'Go %m.directions1 at speed %n', 'goForwardsOrBackwards', 'forwards', 100],
			  [' ', 'Turn %m.directions2 at speed %n', 'turning', 'left', 100],
			  ['', 'Stop Motors', 'stopMotors'],
			  ['', 'Get status of pin %s', 'pinStatus']
			],
		menus:  {
				directions1: ['forwards', 'backwards'],
				directions2: ['left', 'right']
		        },
		url: 'http://leedsrobotics.github.io/'
	};

        
  	var serial_info = {type: 'serial'}; // Declare type of hardware required
        
  	ScratchExtensions.register('Tracey Controller', descriptor, ext, serial_info); // Registers the extension
})({});

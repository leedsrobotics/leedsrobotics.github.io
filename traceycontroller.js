(function(ext) 
{
	var device; // Declares undefined device
	var dataView = null; // View to contain received data
	var state = 'still'; // Current state of device
	var previousCommand = null;
	var previousRightSpeed = 0;
	var previousLeftSpeed = 0;
	var expectPinData = false;
	var pinData = null;
	var threshold = 900;
	
	/**
	 * Return status of the extension
	 */
  	ext._getStatus = function() 
  	{
    		return {status:2, msg: 'Ready'};
  	};
  	
  	
  	function sleep(miliseconds) 
  	{
           var currentTime = new Date().getTime();

           while (currentTime + miliseconds >= new Date().getTime()) {}
       }
	
	
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
        			if(expectPinData == true)
        			{
        				pinData = dataView;
        			}
        		}
        	});
        	
   	};
  	
  	
  	/**
  	 * Declares whether a device is connected, printing out the port its connected through if it is and
  	 * its constructor name.
  	 */
  	ext.serialState = function()
  	{
  		if(!device)
  		{
  			return "No Serial Device Connected";
  		}
  		else
  		{
  	  		var message = device.constructor.name + " connected via " + device.id.toString();
  	  		return message;
  		}
  	};
  	
  	
  	/**
  	 * Sends ID request to the device
  	 */
  	ext.idRequest = function()
  	{
  		var idCommand = "@id"; // Request ID command definition
  		var view = new Uint8Array(3); // View to contain the command being sent
  		
  		// Fill view with the commands individual bytes
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
  		
  		// Fill view with the commands individual bytes
  		for(var x = 0; x < pinCommand.length; x++)
  		{
  			view[x] = pinCommand.charCodeAt(x);
  		}
  		
  		expectPinData = true;
  		device.send(view.buffer); // Send command
  		console.log(pinData);
  		
  		setTimeout(function(){
	  		expectPinData = false;
  			console.log(pinData);
  		}, 1000);
  		console.log( ((pinData[0] & 0xFF) << 8) | (pinData[1] & 0xFF) );
  		var analogVal = ((pinData[0] & 0xFF) << 8) | (pinData[1] & 0xFF);
  		if(analogVal > threshold)
  		{
  			return 'black';
  		}
  		else
  		{
  			return 'white';
  		}
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
  				previousRightSpeed = speed;
  			}
  		
  			// Set left motor full forward and right motor full backwards if left
  			else if(direction == 'right')
  			{
  				view[2] = speed;
  				view[3] = 0x80|speed;
  				previousLeftSpeed = speed;
  			}
  		
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
  				state = direction;
  				previousCommand = view;
  			}
  		}
  	}
  	
  	
  	/**
  	 * Stops the motors from spinning
  	 */
  	ext.stopMotors = function()
  	{
  		console.log(state);
  		if(state != 'still')
  		{
  			var directionCommand = '@m'; // Motor command definition
  			var view = new Uint8Array(4); // View to contain the command being sent
  		
  			// Declare motor command
  			view[0] = directionCommand.charCodeAt(0);
  			view[1] = directionCommand.charCodeAt(1);
  		
  			view[2] = 0x00; // Left motor speed (stops motor)
  			view[3] = 0x00; // Right motor speed (stops motor)
  			previousLeftSpeed = 0;
  			previousRightSpeed = 0;
  			
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
  				state = 'still';
  				previousCommand = view;
  			}
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
  				previousLeftSpeed = speed;
  				previousRightSpeed = speed;
  			}
  			else if(direction == 'backwards')
  			{
  				view[2] = 0x80|speed; // Left motor speed (reversed)
  				view[3] = 0x80|speed; // Right motor speed (reversed)
  			}
  			
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
  				state = 'forwards';
  				previousCommand = view;
  			}
  		}
  	}
  	
  	
  	ext.setIndivMotor = function(motor, speed, duration)
  	{
  		console.log('Running ...');
  		if(speed <= 100 && speed >= 0 && duration > 0)
  		{
  			var directionCommand = '@m'; // Motor command definition
  			var view = new Uint8Array(4); // View to contain the command being sent
  		
  			// Declare motor command
  			view[0] = directionCommand.charCodeAt(0);
  			view[1] = directionCommand.charCodeAt(1);
  		
  			if(motor == 'left')
  			{
  				view[2] = speed; // Left motor speed
  				view[3] = previousRightSpeed; // Right motor speed
  				previousLeftSpeed = speed;
  			}
  			else if(motor == 'right')
  			{
  				view[2] = previousLeftSpeed; // Left motor speed
  				view[3] = speed; // Right motor speed
  				previousRightSpeed = speed;
  			}
  			
  			console.log(view);
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
  				previousCommand = view;
  				
  				console.log('About to sleep ...');
  				sleep(duration * 1000);
  				console.log('... Finished sleeping');
  				if(motor == 'left')
  				{
  					view[2] = 0; // Left motor speed (stops motor)
  					view[3] = previousRightSpeed; // Keep right motor speed the same
  					previousLeftSpeed = 0;
  				}
  				else if(motor == 'right')
  				{
  					view[2] = previousLeftSpeed; // Keep left motor speed the same
  					view[3] = 0; // Right motor speed (stops motor)
  					previousRightSpeed = 0;
  				}
  				
  				console.log(view);
  				device.send(view.buffer); // Send command
  				previousCommand = view;
  				state = '';
  			}
  			
  		}
  		
  	}
  	
  	
  	ext.sendCustomCommand = function(command, params, typeOfParam)
  	{
  		var seper_params = params.split(" ");
  		var view = new Uint8Array(command.length + seper_params.length);
  		
  		for(var x = 0; x < command.length; x++)
  		{
  			view[x] = command.charCodeAt(x);
  		}
  		
  		for(var y = 0; y < seper_params.length; y++)
  		{
  			if(seper_params[y] < 0)
  			{
  				view[y + command.length] = 0x80|parseInt(seper_params[y]) * -1;
  			}
  			else
  			{
  				view[y + command.length] = seper_params[y];
  			}
  		}
  		
  		if(view != previousCommand)
  		{
  			device.send(view.buffer);
  			previousCommand = view;
  		}
  	}
	
	
	/**
	 * Processes that run on extension shutdown
	 */
	ext._shutdown = function(){};


  	// Registers block types, names and corresponding procedures
	var descriptor = {
		blocks: [ ['r', 'Serial State', 'serialState'],
			  ['', 'Request ID', 'idRequest'],
			  ['r', 'Get status of pin %s', 'pinStatus'],
			  ['', 'Go %m.directions1 at speed %n', 'goForwardsOrBackwards', 'forwards', 100],
			  ['', 'Turn %m.directions2 at speed %n', 'turning', 'left', 100],
			  ['', 'Stop Motors', 'stopMotors'],
			  ['', 'Set %m.directions2 motor to %n speed for %n seconds', 'setIndivMotor', 'left', 100, 1],
			  ['', 'Send Command %s with parameters %s', 'sendCustomCommand']
			],
		menus:  {
				directions1: ['forwards', 'backwards'],
				directions2: ['left', 'right'],
		        },
		url: 'http://leedsrobotics.github.io/'
	};

        
  	var serial_info = {type: 'serial'}; // Declare type of hardware required
        
  	ScratchExtensions.register('Tracey Controller', descriptor, ext, serial_info); // Registers the extension
})({});

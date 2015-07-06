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
	var expectedPinData = 1;
	var A0threshold = 800;
	var A1threshold = 660;
	var analogLimit = 1200;
	var currentPinRequest = 1;
	var dataRequested = new Date().getTime();
	var pinVal = 0;
	var storedData = { 
		buffer: [0], 
		latestElement: 0,
		expectedLength: 0,
		pinA1: [0, 0],
		pinA0: [0, 0],
		read: function(num){
			var readData= [];
			//console.log('Entered read function');
			//console.log(num);
			if(this.latestElement + 1 - num < 0)
			{
				console.log('Not enough data');
				return 0;
			}
			else
			{
				//console.log('Viable number of ')
				for(var x = 0; x < num; ++x)
				{
					readData.push(this.buffer[this.latestElement - x]);
					//console.log('Just read a byte');
				}
			}
			
			//console.log('Returning data read ...');
			return readData;
		},
		write: function(data){
			//console.log('writing ...');
			for(var x = 0; x < data.length; ++x)
			{
				if(this.latestElement >= 4096)
				{
					this.latestElement = 0;
				}
				else
				{
					++this.latestElement;
				}
				this.buffer[this.latestElement] = data[x];
			}	
			//console.log(this.buffer);
		},
		writePin: function(pin, data){
			if(pin == 0)
			{
				this.pinA0 = data;
			}
			else
			{
				this.pinA1 = data;
			}
		}

	}
	
	
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
        		//if (dataView.length == 2)
        		//{
        		storedData.write(dataView);
        		if(dataView.length == 2)
        		{
        			dataReceived = true;
        			storedData.writePin(currentPinRequest % 2, dataView);
        			console.log(storedData.pinA0);
        			console.log(storedData.pinA1);
        		}
        		//}
        		//console.log('Latency:');
        	});
        	
   	};
  	
  	
  	ext.sendPinCommand = function(pin)
  	{
  		var pinCommand = "@ar"; // Request ID command definition
  		var view = new Uint8Array(4); // View to contain the command being sent
  		
  		// Fill view with the commands individual bytes
  		for(var x = 0; x < pinCommand.length; x++)
  		{
  			view[x] = pinCommand.charCodeAt(x);
  		}
  		view[3] = pin;
  		
  		storedData.expectedLength = storedData.latestElement + 2;
  		//console.log('Updated Expected Length');
  		device.send(view.buffer); // Send command
  		
  	}
  	
  	
  	
  	
  	function sendPinCommand(pin)
  	{
  		var pinCommand = "@ar"; // Request ID command definition
  		var view = new Uint8Array(4); // View to contain the command being sent
  		
  		// Fill view with the commands individual bytes
  		for(var x = 0; x < pinCommand.length; x++)
  		{
  			view[x] = pinCommand.charCodeAt(x);
  		}
  		view[3] = pin;
  		
  		storedData.expectedLength = storedData.latestElement + 2;
  		//console.log('Updated Expected Length');
  		device.send(view.buffer); // Send command
  		
  	}
  
  	
  	
  	
  	function processPinData(pin)
  	{
  		if(pin == 0)
  		{
  			pinData = storedData.pinA0;
  		}
  		else if(pin == 1)
  		{
  			pinData = storedData.pinA1;
  		}
  		//console.log('ATTEMPTING ...');
  		//pinData = storedData.read(2);
  		
  		//console.log('pinData:');
  		//console.log(pinData);
  		var analogVal = ((pinData[0] & 0xFF) << 8) | (pinData[1] & 0xFF);
  		
  		console.log("Analog Val:");
  		console.log(analogVal);
  		
  		pinData = null;
  		
  		if(analogVal > analogLimit)
  		{
  			return 'white';
  		}
  		
  		if(pin == 0)
  		{
  			if(analogVal > A0threshold)
  			{
  				return 'black';
  			}
  			else
  			{
  				return 'white';
  			}
  		}
  		else if(pin == 1)
  		{
  			if(analogVal > A1threshold)
  			{
  				return 'black';
  			}
  			else
  			{
  				return 'white';
  			}
  		}
  	}
  	
  	
  	/**
  	 * Sends ID request to the device
  	 */
  	ext.pinStatus = function(pin)
  	{
  		
  		//sendPinCommand(pin);
  		
  		//dataRequested = new Date().getTime();
  		//currentPinRequest = 1;
  		
  		var pinColour = processPinData(pin);
  		
  		return pinColour; 
  		
  	}
  	
  	


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
  				state = 'forwards';
  			}
  			else if(direction == 'backwards')
  			{
  				view[2] = 0x80|speed; // Left motor speed (reversed)
  				view[3] = 0x80|speed; // Right motor speed (reversed)
  				state =  'backwards';
  			}
  			
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
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
  	
  	
  	ext.changePinRequest = function(num)
  	{
  		currentPinRequest = num;
  	}
  	
  	
	
	/**
	 * Processes that run on extension shutdown
	 */
	ext._shutdown = function(){};

	setTimeout(setInterval(function(){
		if(device)
		{
			sendPinCommand(currentPinRequest % 2);
			++currentPinRequest;
		}
	}, 120), 1000);


  	// Registers block types, names and corresponding procedures
	var descriptor = {
		blocks: [ ['r', 'Serial State', 'serialState'],
			  ['', 'Request ID', 'idRequest'],
			  ['r', 'Get status of pin %n', 'pinStatus'],
			  ['', 'Go %m.directions1 at speed %n', 'goForwardsOrBackwards', 'forwards', 100],
			  ['', 'Turn %m.directions2 at speed %n', 'turning', 'left', 100],
			  ['', 'Stop Motors', 'stopMotors'],
			  ['', 'Set %m.directions2 motor to %n speed for %n seconds', 'setIndivMotor', 'left', 100, 1],
			  ['', 'Send Command %s with parameters %s', 'sendCustomCommand'],
			  ['', 'Request Pin Data For Pin %s', 'sendPinCommand', 1],
			  ['', 'Change pin request to %n', 'changePinRequest']
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
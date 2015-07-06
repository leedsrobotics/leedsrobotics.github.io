/**
 * Author: Kevin Hodgson
 * 
 * Description: A Extension for ScratchX which can be used to control the robot Tracey
 * 		and other similar devices. Available blocks include setting the speed
 * 		of both motors, turning left or right at a specified speed, setting 
 * 		individual motor speeds, stopping the motors and reading values from
 * 		the infrared sensors.
 */

(function(ext) 
{
	var device; // Declares undefined device
	var dataView = null; // View to contain received data
	var state = 'still'; // Current state of device
	var previousCommand = null; // Previous command sent
	var previousRightSpeed = 0; // Previous speed of right motor
	var previousLeftSpeed = 0; // Previous speed of left motor
	var threshold = 800; // Threshold of the analog values for white and black
	var analogLimit = 1200; // Limit of valid analog value
	var currentPinRequest = 1; // Current pin being requested
	var deviceState = 'No data received'; // The current state of the device
	var pollers = [0, 0]; // Poller values for checking the devices data receival
	
	/**
	 * A Cyclic buffer to contain received data
	 */
	var storedData = { 
		buffer: [0], // Contains all incoming data
		latestElement: 0, // Pointer to te latest element
		pinA1: [0, 0], // Array to contain latest pinA1 data
		pinA0: [0, 0], // Array to contain latest pinA0 data
		
		/**
		 * Reads a specified number of elements from buffer
		 */
		read: function(num){
			var readData= [];
			if(this.latestElement + 1 - num < 0)
			{
				return 0;
			}
			else
			{
				var index = 0;
				for(var x = 0; x < num; ++x)
				{
					index = this.latestElement + 1 - num + x;
					readData.push(this.buffer[index]);
				}
			}
			
			return readData;
		},
		
		/**
		 * Writes data into buffer
		 */
		write: function(data){
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
		},
		
		/**
		 * Writes new pin values into corresponding variables
		 */
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
  	
  	
  	/**
  	 * Waits a specified number of miliseconds
  	 */
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

		if (!device) {
            	tryNextDevice();
        	}
   	}
   
   	
   	/**
   	 * Checks if a compatible device is connected, opening a connection if it is and specifies data received
   	 * should be stored in the buffer
   	 */
   	function tryNextDevice() 
   	{
   		device = potentialDevices.shift(); // Set device to the next available device
        	if (!device) return; // If there was no device available, return

        	device.open({ stopBits: 0, bitRate: 9600, ctsFlowControl: 0 }); // Opens connection
        	
        	// When data is received from device, store the data in the buffer object
        	device.set_receive_handler(function(data) {
        		dataView = new Uint8Array(data);
        		storedData.write(dataView);
        		if(dataView.length == 2)
        		{
        			dataReceived = true;
        			storedData.writePin(currentPinRequest % 2, dataView);
        		}
        	});
        	
   	};

  	
  	/**
  	 * Sends a read request for a specified pin
  	 */
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
  		
  		device.send(view.buffer); // Send command
  	}
  
  	
  	/**
  	 * Processes the high and low data received from a specified pin, turning it into 
  	 * a analog value
  	 */
  	function processPinData(pin)
  	{
  		var pinData = null;
  		
  		// Reads the specified pin data from buffer
  		if(pin == 'A0')
  		{
  			pinData = storedData.pinA0;
  		}
  		else if(pin == 'A1')
  		{
  			pinData = storedData.pinA1;
  		}
  		
  		var analogVal = ((pinData[0] & 0xFF) << 8) | (pinData[1] & 0xFF); // Combines high and low bytes
  		
  		// Ignores abnormal analog values
  		if(analogVal > analogLimit)
  		{
  			return 'white';
  		}
  		
  		// Checks the analog value against the threshold, returning the result
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
  	 * Processes data from a specified pin, returning its current colour
  	 */
  	ext.pinStatus = function(pin)
  	{
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

	
	ext.checkDeviceResponds = function(){
		return deviceState;
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
  		
  			// Prevents repeated commands
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
  			
  			// Prevents repeated commands
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
  			
  			// Prevents repeated commands
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
  				previousCommand = view;
  			}
  		}
  	}
  	
  	
  	/**
  	 * Sets a specified motor to a specified speed for a specified duration
  	 */
  	ext.setIndivMotor = function(motor, speed, duration)
  	{
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
  			
  			// Prevents repeated commands
  			if(view != previousCommand)
  			{
  				device.send(view.buffer); // Send command
  				previousCommand = view;
  				
  				// Waits the specified amount of time then stops the specified motor
  				sleep(duration * 1000);
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
  				
  				device.send(view.buffer); // Send command
  				previousCommand = view;
  				state = '';
  			}
  			
  		}
  		
  	}
  	
  	
  	/**
  	 * Sends a custom command with custom parameters
  	 */
  	ext.sendCustomCommand = function(command, params, typeOfParam)
  	{
  		var seper_params = params.split(" ");
  		var view = new Uint8Array(command.length + seper_params.length);
  		
  		for(var x = 0; x < command.length; x++)
  		{
  			view[x] = command.charCodeAt(x);
  		}
  		
  		// Checks parameters, converting the negative values
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
  		
  		// Prevents repeated commands
  		if(view != previousCommand)
  		{
  			device.send(view.buffer); // Sends command
  			previousCommand = view; 
  		}
  	}
  	
  	
  	ext.readFromBuffer = function(num)
  	{
  		var index = storedData.latestElement - num;
  		if(index < 0)
  		{
  			index = 4096;
  		}
  		return storedData[index];
  	}
  	
  	
	
	/**
	 * Processes that run on extension shutdown
	 */
	ext._shutdown = function(){};


	// Creates new thread, repeated polling the pins A0 and A1 for values
	setTimeout(setInterval(function(){
		if(device)
		{
			sendPinCommand(currentPinRequest % 2);
			++currentPinRequest;
		}
	}, 120), 1000);


	// Checks if data is being received from device
	setTimeout(setInterval(function(){
		pollers[currentPinRequest % 2] = storedData.latestElement;
		if(pollers[0] != pollers[1])
		{
			deviceState = 'Receiving data ...';
		}
		else
		{
			deviceState =  'No data received';
		}
	}, 120), 1060);


  	// Registers block types, names and corresponding procedures
	var descriptor = {
		blocks: [ ['r', 'Device State', 'checkDeviceResponds'],
			  ['r', 'Get current colour of pin %s', 'pinStatus', 'A0'],
			  ['', 'Go %m.directions1 at speed %n', 'goForwardsOrBackwards', 'forwards', 100],
			  ['', 'Turn %m.directions2 at speed %n', 'turning', 'left', 100],
			  ['', 'Stop Motors', 'stopMotors'],
			  ['', 'Set %m.directions2 motor to %n speed for %n seconds', 'setIndivMotor', 'left', 100, 1],
			  ['', 'Send Command %s with parameters %s', 'sendCustomCommand'],
			  ['r', 'Read byte from buffer %n bytes old', 'readFromBuffer', 0]
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

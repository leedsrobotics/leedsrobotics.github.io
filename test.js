(function(ext) 
{
    var device; // Declares undefined device
    var dataView = null; // View to contain received data


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
                console.log(String.fromCharCode(dataView[x]));  
            }
        });
    };


    /**
     * Processes that run on extension shutdown
     */
    ext._shutdown = function(){};
    
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

    // Registers block types, names and corresponding procedures
    var descriptor = {
        blocks: [['', 'Go %m.directions1 at speed %n', 'goForwardsOrBackwards', 'forwards', 100]],
		menus:  {
				directions1: ['forwards', 'backwards'],
		        }
    };


    var serial_info = {type: 'serial'}; // Declare type of hardware required

    ScratchExtensions.register('Extension Name', descriptor, ext, serial_info); // Registers the extension
})({});

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
   
   var poller = null;
    var watchdog = null;
    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
        if (!device) return;

        device.open({ stopBits: 0, bitRate: 38400, ctsFlowControl: 0 });
        device.set_receive_handler(function(data) {
            alert("Receiving...");
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
  	
  ext.idRequest = function()
  {
    var buffer = new ArrayBuffer(3);
    buffer[0] = "@";
    buffer[1] = "i";
    buffer[2] = "d";
    device.send(buffer);
    
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
			]
	};

        
  var serial_info = {type: 'serial'};
        
  ScratchExtensions.register('Practise Extensions', descriptor, ext, serial_info);
})({});

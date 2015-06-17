(function(ext) 
{
  var device;
  var potentialDevices = [];
	
  ext._getStatus = function() 
  {
    return {status:2, msg: 'Ready'};
  };
	
  ext._deviceConnected = function(dev) 
  {
    potentialDevices.push(dev);
    if (device === undefined) {
    	device = dev;
    	console.log(dev);
    	device.open();
    	device.send(["@"]);
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
  	  alert("Serial Device Connected!");
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

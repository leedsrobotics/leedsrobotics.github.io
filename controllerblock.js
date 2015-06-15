// joystickExtension.js
// Shane M. Clements, November 2013
// Joystick Scratch Extension
//
// This is an extension for development and testing of the Scratch Javascript Extension API.

new (function() {
    var device = null;
    var input = null;
    var poller = null;
    var ext = this;

    ext._deviceConnected = function(dev) {
        alert("Hello");
        if(device) return;

        device = dev;
        device.open();

        poller = setInterval(function() {
            input = device.read(48);
        }, 10);

//        setInterval(function() { console.log(input); }, 100);
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        device = null;
        stopPolling();
    };

    function stopPolling() {
        if(poller) clearInterval(poller);
        poller = null;
    }

    ext._shutdown = function() {
        if(poller) clearInterval(poller);
        poller = null;

        if(device) device.close();
        device = null;
    }

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'Controller disconnected'};
        return {status: 2, msg: 'Controller connected'};
    }

    // Converts a byte into a value of the range -1 -> 1 with two decimal places of precision
    function convertByteStr(byte) { return (parseInt(byte, 16) - 128) / 128; }
    ext.readJoystick = function() {
        alert("Hello");
    }

    var descriptor = {
        blocks: [
            ['', 'Print Joystick State', 'readJoystick']
        ]
    };
    ScratchExtensions.register('Joystick', descriptor, ext, {type: 'hid', vendor:0x045e, product:0x028e});
})();

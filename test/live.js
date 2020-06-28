const _ = require('lodash');
var joystickUtils = require('../joystick-utils');

var js = new joystickUtils({
	// inputcb: function(data) {
	// 	console.log(data);
	// },
	// 
	framecb: function(command) {
		console.log(command);

		if (js.memorymatch(['→', '↓', '↘', '→ + ○']))
			console.log("MATCHED");
	}
});
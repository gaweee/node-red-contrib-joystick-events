var joystickUtils = require('../joystick-utils');



	let translate = 1;
	let joystickconfig = {
		jsid: 0,
		...((translate == 1) && { framecb: data => node.send({ payload: data || "" }) }),
		...((translate == 0) && { inputcb: data => node.send({ payload: data || "" }) }),
	}
	console.log(joystickconfig);
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
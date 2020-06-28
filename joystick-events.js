var joystickUtils = require('./joystick-utils');

module.exports = function(RED) {

	var joystick;

	function joystickIn(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		
		var translate = (config.translate);
		try {
			joystick = new joystickUtils({
				jsid: config.jsid,
				framerate: config.framerate,
				memorysize: config.memorysize,
				...((config.translate == '1') && { framecb: data => node.send({ payload: data || "" }) }),
				...((config.translate == '0') && { inputcb: data => node.send({ payload: data || "" }) }),
			});

			this.status({
				fill: "green",
				shape: "dot",
				text: "connected"
			});
		} catch (err) {
			this.status({
				fill: "red",
				shape: "ring",
				text: "disconnected"
			});
		}

		this.on('close', function() {
		    joystick.cease();
		});
	}
	RED.nodes.registerType("joystick in", joystickIn);


	function joystickMatch(config) {
		RED.nodes.createNode(this, config);
		var node = this;

		node.on('input', function(data) {
			node.send(joystick.memorymatch(config.pattern.split(',')) ? [config.pattern, null] : [null, data]);
        });
	}

	RED.nodes.registerType("joystick match", joystickMatch);
}

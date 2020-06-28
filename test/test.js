const assert = require('assert').strict;
const _ = require('lodash');

var joystickUtils = require('../joystick-utils');

var js = new joystickUtils({
	// inputcb: function(data) {
	// 	console.log(data);
	// },
	// 
	// framecb: function(command) {
	// 	console.log(command);

	// 	if (js.memorymatch(['→', '↓', '↘', '→ + ○']))
	// 		console.log("MATCHED");
	// }
});


describe("Axis symbols test", function() {
	it("Should return nothing if nothing is provided", function() {
		assert.strictEqual(js.getSymbol(), "");
    });	
	
	it("Should be able to translate basic inputs", function() {
		for (let buttonkey in js.controller)
			assert.strictEqual(js.getSymbol(buttonkey, 1), js.controller[buttonkey]);
	});

	it("Should be able to flip axis polarity", function() {
		assert.strictEqual(js.getSymbol('AXIS0', -10), "←");
		assert.strictEqual(js.getSymbol('AXIS3', -10), "←");

		assert.strictEqual(js.getSymbol('AXIS1', -10), "↑");
		assert.strictEqual(js.getSymbol('AXIS4', -10), "↑");
    });

});

describe("Translation test", function() {
	let register;

	it("Should return nothing if nothing is provided", function() {
		assert.strictEqual(js.translateCommands({}), "");
    });

    it("Should return nothing if unmatch codes are provided", function() {
		assert.strictEqual(js.translateCommands({AXIS99: 10 }), "");
		assert.strictEqual(js.translateCommands({BTN99: 1 }), "");

    	register = {
    		BTN1: 1,		// ○
			AXIS99: 10,
			BTN99: 1
		}
		assert.strictEqual(js.translateCommands(register), "○");
    });

    it("Should be able to translate combination commands using a + sign", function() {
		register = {
			BTN4: 1,		// L1
			BTN2: 1,		// △
			AXIS4: -10		// →
		};
		assert.strictEqual(js.translateCommands(register), ['L1', '△', '↑'].sort().join(" + "));

		register = {
			BTN11: 1,		// L3
			BTN1: 1,		// ○
			BTN3: 1,		// □
			AXIS4: -10,		// →
			AXIS7: 10		// ↓
		};
		assert.strictEqual(js.translateCommands(register), ['L3', '○', '□', '↑', '↓'].sort().join(" + "));
    });

    it("Should be able to translate diagonals", function() {
		register = {
			AXIS0: 10,		// →
			AXIS1: -10		// ↑
		};
		assert.strictEqual(js.translateCommands(register), ['↗'].sort().join(" + "));

		register = {
			AXIS0: 10,		// →
			AXIS1: 10		// ↓
		};
		assert.strictEqual(js.translateCommands(register), ['↘'].sort().join(" + "));

		register = {
			AXIS0: -10,		// ←
			AXIS1: 10		// ↓
		};
		assert.strictEqual(js.translateCommands(register), ['↙'].sort().join(" + "));

		register = {
			AXIS0: -10,		// ←
			AXIS1: -10		// ↑
		};
		assert.strictEqual(js.translateCommands(register), ['↖'].sort().join(" + "));
	});

    it("Should be able to translate multiple diagonals", function() {
		register = {
			BTN4: 1,		// L1
			BTN5: 1,		// R1
			BTN0: 1,		// x
			BTN1: 1,		// ○
			AXIS4: -10,		// ↑
			AXIS7: 10,		// ↓
			AXIS3: 10		// →
		};
		assert.strictEqual(js.translateCommands(register), ['L1', 'R1', 'x', '○', '↗', '↘'].sort().join(" + "));
    });
});

describe("Diagonals swap test", function() {
	
	it("Should return nothing if nothing is provided", function() {
		assert.strictEqual(js.diagonalsSwap(""), "");
		assert.strictEqual(js.diagonalsSwap("", false), "");
    });
});


js.cease();
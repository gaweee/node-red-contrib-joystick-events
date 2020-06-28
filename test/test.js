const assert = require('assert').strict;
const _ = require('lodash');
const log = require('why-is-node-running');


describe("Axis symbols test", function() {
	it("Should return nothing if nothing is provided", function() {
		assert.strictEqual(1,1);
	});
});

var joystickUtils = require('../joystick-utils');
var js = new joystickUtils({ mock: true, memorysize: 10 });

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

	it("Should should not translate single direction", function() {
		assert.strictEqual(js.diagonalsSwap("△ + ↑"), ['△', '↑'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("□ + →"), ['□', '→'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("○ + ↓"), ['○', '↓'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("x + ←"), ['x', '←'].sort().join(' + '));
	});
	
	it("Should translate single diagonals", function() {
		assert.strictEqual(js.diagonalsSwap("△ + ↑ + →"), ['△', '↗'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("△ + ↓ + →"), ['△', '↘'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("□ + ↑ + ←"), ['□', '↖'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("□ + ↓ + ←"), ['□', '↙'].sort().join(' + '));
	});
	
	it("Should translate multiple diagonals", function() {
		assert.strictEqual(js.diagonalsSwap("○ + ↓ + ↑ + →"), ['○', '↘', '↗'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("○ + ↓ + ↑ + ←"), ['○', '↖', '↙'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("x + ↓ + → + ←"), ['x', '↙', '↘'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("x + ↑ + → + ←"), ['x', '↖', '↗'].sort().join(' + '));
	});
	
	it("Should reverse diagonals to basic directions", function() {
		assert.strictEqual(js.diagonalsSwap("△ + ↗", false), ['△', '↑', '→'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("△ + ↘", false), ['△', '↓', '→'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("□ + ↖", false), ['□', '↑', '←'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("□ + ↙", false), ['□', '↓', '←'].sort().join(' + '));
	});
	
	it("Should reverse multiple diagonals to basic directions", function() {
		assert.strictEqual(js.diagonalsSwap("○ + ↖ + ↗", false), ['○', '↑', '←', '→'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("○ + ↙ + ↘", false), ['○', '↓', '←', '→'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("x + ↖ + ↙", false), ['x', '↑', '↓', '←'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("x + ↗ + ↘", false), ['x', '↑', '↓', '→'].sort().join(' + '));
		assert.strictEqual(js.diagonalsSwap("△ + ↗ + ↙", false), ['△', '↑', '↓', '←', '→'].sort().join(' + '));
	});
});

describe("Memory match test", function() {
	beforeEach(function(done) {
		js.memory = ['→','↘','→','→ + □','L1 + → + □','↙','↙ + R2', '△', 'L1 + ○'];
		done();
	});

	it("Should not match if memory is empty or pattern is empty", function() {
		assert.equal(js.memorymatch([], false), false);
		assert.equal(js.memorymatch([''], false), false);
	});
	
	it("Should match single commands", function() {
		assert(js.memorymatch(['→'], false));
		assert(js.memorymatch(['↘'], false));
		assert(js.memorymatch(['→ + □'], false));
		assert(js.memorymatch(['R2'], false));
		assert(js.memorymatch(['L1 + ○'], false));
	});

	it("Should match partial commands", function() {
		assert(js.memorymatch(['□'], false));
		assert(js.memorymatch(['R2'], false));
		assert(js.memorymatch(['←'], false));
	});

	it("Should match diagonals commands", function() {
		assert(js.memorymatch(['← + R2'], false));
		assert(js.memorymatch(['↓'], false));
	});

	it("Should not match non-existent commands", function() {
		assert.equal(js.memorymatch(['↑'], false), false);
		assert.equal(js.memorymatch(['x'], false), false);
	});

	it("Should match long commands", function() {
		assert(js.memorymatch(['→','↘','→'], false));
		assert(js.memorymatch(['→','→','→ + □'], false));
		assert(js.memorymatch(['↓','△'], false));
		assert(js.memorymatch(['↓','△', 'L1 + ○'], false));
	});

	it("Should not match non-sequential chains", function() {
		assert.equal(js.memorymatch(['↙', '→ + □'], false), false);
		assert.equal(js.memorymatch(['△', '↘'], false), false);
	});

    // Shutdown
	after(function(done) {
		js.cease();
		done();
	});
});
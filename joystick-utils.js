const fs = require('fs');
const _ = require('lodash');

const AXISDIAGONALS = {
	'↗': ['↑', '→'],
	'↘': ['↓', '→'],
	'↙': ['↓', '←'],
	'↖': ['↑', '←']
}
const UNIQDIAG = _.keys(AXISDIAGONALS);
const UNIQAXIS = _.uniq(_.flattenDeep(_.toArray(AXISDIAGONALS)));
	
module.exports = class joystickUtils {
	config;
	controller;
	joystick;
	register = {};
	memory = [];
	framehandler;

	constructor(config) {
		this.config = _.extend({ jsid: 0, controller: "DS4", framerate: 20, memorysize: 60 }, config);
		this.controller = require('./controllers/' + this.config.controller);

		let jsu = this;
		// Check if /dev/input/js' + id is availables
		if (fs.existsSync('/dev/input/js' + this.config.jsid)) {
			this.joystick = new (require('joystick'))(this.config.jsid, 3500, 350);
			

			// Setup Axis Handler
			this.joystick.on('axis', function(data) {
				jsu.register["AXIS" + data.number] = data.value;

				if (typeof jsu.inputcb == "function")
					jsu.eventcb.call(joystickUtils, data);
			});

			// Setup Buttons Handler
			this.joystick.on('button', function(data) {
				jsu.register["BTN" + data.number] = (data.value != 0);

				if (typeof jsu.config.inputcb == "function") {
					jsu.config.inputcb.call(jsu, data);
				}
			});
		} else {
			throw new Error('/dev/input/js' + this.config.jsid + " does not exist");
		}

		this.framehandler = setInterval(function() {
			let command;
			if (command = jsu.translateCommands(jsu.register)) {
				// Fill up memory here (it autocleans)
				jsu.memory.push(command);
				jsu.memory = _.takeRight(jsu.memory, jsu.config.memorysize);

				if (typeof jsu.config.framecb == "function")
					jsu.config.framecb.call(jsu, command);
			}
		}, 1000/this.config.framerate);
	}

	
	/**
	 * Cleans up on destruction
	 * @return {Void}
	 */
	cease() {
		clearInterval(this.framehandler);
		// console.log("teardown, clearInterval called");
	}


	/**
	 * Checks the axis symbol and if the magnitude is < 0, reverse the symbol
	 * @param  {text} symbol the ascii symbol
	 * @param  {int} magnitude 16bit signed magnitude
	 * @return {text} either the passthrough or inverted symbol
	 */
	getSymbol(key, magnitude) {
		var symbol = this.controller[key] || ""
		if (_.startsWith(key, "AXIS") && symbol && magnitude < 0) {
			switch (symbol) {
				case '↑':
					return '↓';
				case '↓':
					return '↑';
				case '→':
					return '←';
				case '←':
					return '→';
			}
		}
		return symbol;
	}


	/**
	 * Renders the → + △ + □ sequences
	 * @return {Void}
	 */
	translateCommands(register) {
		var stack = [];

		for (let key in register) {
			var value = register[key];
			var symbol = this.getSymbol(key, value);
			if (value && symbol)
				stack.push(symbol);
		}

		stack = _.uniq(stack);
		stack.sort();

		var translated;
		if (translated = stack.join(" + ")) 
			translated = this.diagonalsSwap(translated);

		return translated;
	}


	/**
	 * swaps some up-down-left-right combination for diagonals
	 * Multiple diagonals may appear if various keys are all pressed in tandem.
	 * E.g. If ['↑', '↓', '→', '□'] all exists, then the resulting map would be ['↗', '↘', '□']
	 * @param  {Array}  stack the comamnd stack
	 * @param  {Boolean} simplify to simplify, false for expansion
	 * @return {Array} the simplified stack
	 */
	diagonalsSwap(command, simplify=true) {
		var found = false;
		if (simplify) {
			let commandparts = command.split(' + ');
			for (let diag in AXISDIAGONALS) {
				var axisparts = AXISDIAGONALS[diag];
				if (_.intersection(commandparts, axisparts).length == axisparts.length) {
					found = true;
					commandparts.push(diag);
				}
			}
			
			if (found) {
				commandparts = _.uniq(_.without(commandparts, ...UNIQAXIS));
				commandparts.sort();
				command = commandparts.join(' + ');
			}
			
			return command;
		} else {
			for (let diag in AXISDIAGONALS)
				command = command.replace(diag, AXISDIAGONALS[diag].join(" + "));

			return _.uniq(command.split(' + ')).join(' + ');
		}
	}


	/**
	 * Utility feature to check if a particular sequence is matched
	 * Once a feature is matched, the memory will be cleared for other matches to occur
	 * @return {Boolean}
	 */
	memorymatch(commands, clear=true) {
		var nextpos = 0;
		for (let command of commands) {
			let found = false;
			let searchparts = this.diagonalsSwap(command, false).split(' + ');
			for (let i=nextpos; i<this.memory.length; i++) {

				let memoryparts = this.diagonalsSwap(this.memory[i],false).split(' + ');
				if (_.intersection(memoryparts, searchparts).length == searchparts.length) {
					found = true;
					nextpos = i+1;
					break;
				}
			}

			if (!found)
				return false;
		}

		// clear memory afterwards
		if (clear)
			this.memory = [];

		return true;
	}
}
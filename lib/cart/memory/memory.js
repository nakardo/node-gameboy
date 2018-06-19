'use strict';

function Unsupported () {
    throw new Error('Unsupported memory type');
}

const memory = (new Array(0xff)).fill(Unsupported);
memory[0] = require('./rom-only');
memory[1] = require('./mbc1');

module.exports = memory;

'use strict';

const memory = (new Array(0xff)).fill(function () {
    throw new Error('Unsupported memory type');
});

memory[0] = require('./rom-only');
memory[1] = memory[2] = memory[3] = require('./mbc1');

module.exports = memory;

#!/usr/bin/env node

'use strict';

const fs = require('fs');
const Gameboy = require('../');


fs.readFile('./roms/tetris.gb', (err, data) => {

    if (err) throw err;

    const gameboy = new Gameboy();
    gameboy.loadCart(data);
    gameboy.powerOn();
});

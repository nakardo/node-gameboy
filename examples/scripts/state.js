'use strict';

const fs = require('fs');
const Gameboy = require('../../');


const gameboy = new Gameboy();
gameboy.loadCart(fs.readFileSync('./roms/tetris.gb'));
gameboy.start();

setTimeout(() => {
    gameboy.pauseResume();
    console.log(JSON.stringify(gameboy));
    process.exit();
}, 2000);

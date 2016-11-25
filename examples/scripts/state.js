'use strict';

const fs = require('fs');
const Gameboy = require('../../');


const gameboy = new Gameboy();
gameboy.loadCart(fs.readFileSync('./roms/donkeykong.gb'));
gameboy.start();

if (fs.existsSync('state.sav')) {
    const state = fs.readFileSync('state.sav').toString();
    gameboy.fromJSON(state);
}

process.on('SIGINT', function () {
    gameboy.pauseResume();
    console.log(JSON.stringify(gameboy));
    process.exit(0);
});

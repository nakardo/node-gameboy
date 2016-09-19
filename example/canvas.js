'use strict';

const fs = require('fs');
const Gameboy = require('../');
const Canvas = require('canvas');


const gameboy = new Gameboy(new Canvas(160, 144));
gameboy.loadCart(fs.readFileSync('./roms/drmario.gb'));
gameboy.powerOn();


let i = 0;

gameboy.screen.on('frame', (data) => {
    if (++i % 30) return;
    fs.writeFile(`./screenshot/${i / 30}.png`, data);
});

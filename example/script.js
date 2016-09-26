'use strict';

const fs = require('fs');
const Gameboy = require('../');

const gameboy = new Gameboy();
gameboy.loadCart(fs.readFileSync('./roms/opus5.gb'));
gameboy.powerOn();


let i = 0;

gameboy.gpu.on('frame', (canvas) => {
    if (++i % 60) return;
    fs.writeFile(`./screenshot/${i / 60}.png`, canvas.toBuffer());
});

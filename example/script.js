'use strict';

const fs = require('fs');
const cart = fs.readFileSync('./roms/07-jr,jp,call,ret,rst.gb');
const bios = fs.readFileSync('./support/bios.bin');
const Gameboy = require('../');


const gameboy = new Gameboy();
gameboy.loadCart(cart);
gameboy.powerOn();

let i = 0;
gameboy.gpu.on('frame', (canvas) => {
    if (++i % 60) return;
    fs.writeFile(`./screenshot/${i / 60}.png`, canvas.toBuffer());
});

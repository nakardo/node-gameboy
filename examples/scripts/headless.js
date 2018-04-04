'use strict';

const fs = require('fs');
const Gameboy = require('../../');


const gameboy = new Gameboy();
gameboy.loadCart(fs.readFileSync('./roms/tetris.gb'));
gameboy.start();

let i = 0;
gameboy.gpu.on('frame', (canvas) => {
    if (++i % 60) return;
    fs.writeFileSync(`./screenshot/${i / 60}.png`, canvas.toBuffer());
});

'use strict';

const fs = require('fs');
const GIFEncoder = require('gifencoder');
const encoder = new GIFEncoder(160, 144);
const Gameboy = require('../../');


encoder.createReadStream().pipe(fs.createWriteStream('out.gif'))

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(1000 / 60);
encoder.setQuality(5);

const gameboy = new Gameboy();
gameboy.loadCart(fs.readFileSync('./roms/marioland.gb'));
gameboy.start();

gameboy.gpu.on('frame', (canvas) => {
    encoder.addFrame(canvas.getContext('2d'));
});

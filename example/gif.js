'use strict';

const fs = require('fs');
const GIFEncoder = require('gifencoder');
const encoder = new GIFEncoder(160, 144);
const cart = fs.readFileSync('./roms/marioland.gb');
const Gameboy = require('../');


encoder.createReadStream().pipe(fs.createWriteStream('out.gif'))

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(1000 / 60);
encoder.setQuality(5);

const gameboy = new Gameboy(cart);
gameboy.powerOn();

gameboy.gpu.on('frame', (canvas) => {
    encoder.addFrame(canvas.getContext('2d'));
});

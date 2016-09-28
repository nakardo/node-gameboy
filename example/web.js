'use strict';

const fs = require('fs');
const cart = fs.readFileSync('./roms/opus5.gb');
const bios = fs.readFileSync('./support/bios.bin');
const Gameboy = require('../');


localStorage.debug = 'gpu';

const gameboy = new Gameboy(bios);
gameboy.loadCart(fs.readFileSync('./roms/opus5.gb'));
gameboy.powerOn();

const canvas = document.getElementById('frame');
const ctx = canvas.getContext('2d');

gameboy.gpu.on('frame', (offcanvas) => {
    ctx.drawImage(offcanvas, 0, 0);
});

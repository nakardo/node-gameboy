'use strict';

const fs = require('fs');
const cart = fs.readFileSync('./roms/opus5.gb');
const bios = fs.readFileSync('./support/bios.bin');
const Gameboy = require('../');


localStorage.debug = 'joypad';

const gameboy = new Gameboy(bios);
gameboy.loadCart(cart);
gameboy.powerOn();

// Joypad

document.onkeydown = (e) => gameboy.joypad.keyDown(e);
document.onkeyup = (e) => gameboy.joypad.keyUp(e);

// Render

const canvas = document.getElementById('frame');
const ctx = canvas.getContext('2d');

gameboy.gpu.on('frame', (offcanvas) => {
    ctx.drawImage(offcanvas, 0, 0);
});

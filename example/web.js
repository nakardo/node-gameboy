'use strict';

const fs = require('fs');
const Gameboy = require('../');

const offcanvas = document.createElement('canvas');
offcanvas.width = 160;
offcanvas.height = 144;

const gameboy = new Gameboy(offcanvas);
gameboy.loadCart(fs.readFileSync('./roms/opus5.gb'));
gameboy.powerOn();

const canvas = document.getElementById('frame');
const ctx = canvas.getContext('2d');

gameboy.screen.on('frame', (frame) => {
    ctx.drawImage(frame, 0, 0);
});

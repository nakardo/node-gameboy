'use strict';

const Gameboy = require('../');


localStorage.debug = '';

const gameboy = new Gameboy();

// Buttons

const inputAction = document.getElementById('input');
const pauseAction = document.getElementById('pause');
const resetAction = document.getElementById('reset');

function loadFile () {
    if (!this.files.length) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        gameboy.loadCart(reader.result);
        gameboy.start();
    };
    reader.readAsArrayBuffer(this.files[0]);
}

inputAction.addEventListener('change', loadFile);
pauseAction.addEventListener('click', () => gameboy.pauseResume());
resetAction.addEventListener('click', () => gameboy.reset());

// Joypad

document.addEventListener('keydown', (e) => gameboy.joypad.keyDown(e.keyCode));
document.addEventListener('keyup', (e) => gameboy.joypad.keyUp(e.keyCode));

// Render

const canvas = document.getElementById('frame');
const ctx = canvas.getContext('2d');

gameboy.gpu.on('frame', (offcanvas) => {
    ctx.drawImage(offcanvas, 0, 0);
});

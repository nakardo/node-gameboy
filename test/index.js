const Gameboy = require('../');
const gameboy = new Gameboy();

gameboy.loadCart('./roms/tetris.gb');
gameboy.powerOn();

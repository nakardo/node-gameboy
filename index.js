var Gameboy = require('./lib/gameboy')();
var Cart = require('./lib/cart')('./roms/tetris.gb');


Gameboy.insertCart(Cart);
Gameboy.powerOn();

// setTimeout(function () { Gameboy.stop(); }, 2000);

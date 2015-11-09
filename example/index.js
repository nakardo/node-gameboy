'use strict';

var Gameboy = require('../lib/gameboy')();
var Cart = require('../lib/cart')('./example/roms/tetris.gb');


Gameboy.insertCart(Cart);
Gameboy.powerOn();

// setTimeout(function () { Gameboy.stop(); }, 2000);

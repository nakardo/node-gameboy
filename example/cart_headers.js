'use strict';

const fs = require('fs');
const file = fs.readFileSync('./roms/cpu_instrs/cpu_instrs.gb');
const Cart = require('../lib/cart');


const cart = new Cart(file);
console.log(JSON.stringify(cart.toJSON()));

'use strict';

const fs = require('fs');
const file = fs.readFileSync('./roms/marioland.gb');
const Cart = require('../lib/cart');


const cart = new Cart(file);
console.log(JSON.stringify(cart.toJSON()));

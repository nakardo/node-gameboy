'use strict';

const fs = require('fs');
const Cart = require('../../lib/cart');


const cart = new Cart(fs.readFileSync('./roms/pokemon.gb'));
console.log(JSON.stringify(cart.toJSON()));

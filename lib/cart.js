'use strict';

var fs = require('fs');
var debug = require('debug')('cart');


function Cart(path) {

    if (!(this instanceof Cart)) {
        return new Cart(path);
    }

    this._path = path;

    Object.defineProperty(this, 'data', {
        value: fs.readFileSync(path)
    });

    Object.seal(this);
}

module.exports = Cart;

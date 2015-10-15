'use strict';

var fs = require('fs');
var debug = require('debug')('cart');


function Cart(path) {

    if (!(this instanceof Cart)) {
        return new Cart(path);
    }

    this._path = path;

    var data = fs.readFileSync(path);
    Object.defineProperty(this, 'data', { value: data });
}

module.exports = Cart;

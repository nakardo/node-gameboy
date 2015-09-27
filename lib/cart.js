var fs = require('fs');
var debug = require('debug')('cart');


function Cart(path) {

    if (!(this instanceof Cart)) {
        return new Cart(path);
    }

    this._path = path;
    this._data = fs.readFileSync(this._path);
}

Object.defineProperty(Cart.prototype, 'data', {
    get: function () {
        return this._data;
    }
});

module.exports = Cart;

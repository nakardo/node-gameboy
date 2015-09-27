var fs = require('fs');
var debug = require('debug')('cart');


module.exports = function Cart(path) {

    this._path = path;
    this._data = null;
}

Object.defineProperty(Cart.prototype, data, {
    get: function () {
        return this._data;
    }
});

Cart.prototype.load = function (memory) {

    fs.readFile(this._path, function (err, data) {

        if (err) {
            debug('unable to load cart at %s', this._path)
            throw err;
        }
        this._data = data;
    });
};

var fs = require('fs')
  , mmu = require('mmu');


function Cart(path) {

    this._path = path;
}

Cart.prototype.load = function (memory) {

    fs.readFile(this._path, function (err, data) {
        if (err) throw err;
        memory.set(data, 0x4000);
    });
};

module.exports = Cart;

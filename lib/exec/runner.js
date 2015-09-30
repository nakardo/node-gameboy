var debug = require('debug')('runner');

var TIMEOUT = 10;

function Runner() {

    if (!(this instanceof Runner)) {
        return new Runner();
    }

    this._before = null;
    this._after = null;
    this._opcodes = {};

    this.before = before.bind(this);
    this.after = after.bind(this);
    this.opcode = opcode.bind(this);
    this.exec = exec.bind(this);
}

var before = function (fn) {
    this._before = fn;
};

var after = function (fn) {
    this._after = fn;
};

var opcode = function (opcode, fn) {
    this._opcodes[opcode.toLowerCase()] = fn;
};

var exec = function (inst) {

    var fns = [
        this._before,
        this._opcodes[inst.mnemonic.toLowerCase()],
        this._after
    ];
    var timeout = null;

    var _next = function () {
        var args = Array.prototype.slice.call(arguments);
        return function () {
            next.apply(this, args);
        };
    };

    var next = function (context, done) {

        var args = Array.prototype.slice.call(arguments);

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(function () {
            throw new Error(opcode + ' timed out');
        }, TIMEOUT);

        if (fns.length) {
            var fn = fns.shift().bind(context);
            fn(_next.apply(this, args));
        } else {
            clearTimeout(timeout);
            done();
        }
    };

    return next;
};

module.exports = Runner;

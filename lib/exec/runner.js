var TIMEOUT = 10;

function Runner() {

    if (!(this instanceof Runner)) {
        return new Runner();
    }

    this._before = null;
    this._after = null;
    this._opcodes = {};
}

Runner.prototype.before = function (fn) {
    this._before = fn;
};

Runner.prototype.after = function (fn) {
    this._after = fn;
};

Runner.prototype.opcode = function (opcode, fn) {
    this._opcodes[opcode.toLowerCase()] = fn;
};

Runner.prototype.exec = function (inst) {

    var fns = [this._before, this._opcodes[opcode], this._after];
    var timeout = null;

    var next = function (context, done) {

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(function () {
            throw new Error(opcode + ' timed out');
        }, TIMEOUT);

        if (fns.length) {
            var fn = fns.shift().bind(context);
            var args = Array.prototype.slice.call(arguments);
            fn(function () { next.apply(this, args); });
        } else {
            clearTimeout(timeout);
            done();
        }
    };

    return next;
};

module.exports = Runner;

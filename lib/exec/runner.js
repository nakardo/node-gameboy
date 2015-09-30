var debug = require('debug')('exec');


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

    var instFn = this._opcodes[inst.mnemonic.toLowerCase()];
    if (!instFn) {
        debug('%s not implemented. stop', inst.mnemonic);
        process.exit(1);
    }

    var fns = [this._before, instFn, this._after];
    var internals = {};

    return function (cpu, done) {

        fns.forEach(function (fn) {
            if (fn) fn.call(internals, inst, cpu);
        });
        return done();
    }
};

module.exports = Runner;

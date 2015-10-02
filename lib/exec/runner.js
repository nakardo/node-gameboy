var debug = require('debug')('exec');


function Runner() {

    if (!(this instanceof Runner)) {
        return new Runner();
    }

    this._before = null;
    this._after = null;
    this._insts = {};

    this.before = before.bind(this);
    this.after = after.bind(this);
    this.inst = inst.bind(this);
    this.exec = exec.bind(this);
}

var before = function (fn) {
    this._before = fn;
};

var after = function (fn) {
    this._after = fn;
};

var inst = function (mnemonic, fn) {
    this._insts[mnemonic.toLowerCase()] = fn;
};

var exec = function (spec) {

    var instFn = this._insts[spec.mnemonic.toLowerCase()];
    if (!instFn) {
        debug('%s not implemented. stop', spec.mnemonic);
        process.exit(1);
    }

    var fns = [this._before, instFn, this._after];
    var internals = {};

    return function (cpu, done) {

        fns.forEach(function (fn) {
            var res = fn.call(internals, spec, cpu);
            if (res === undefined && fn === instFn) {
                debug('last operation returned undefined. is it implemented?');
            }
        });
        return done();
    }
};

module.exports = Runner;

var debug = require('debug')('runner');


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
    this.prebake = prebake.bind(this);
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

var prebake = function (spec) {

    var before = this._before;
    var instFn = this._insts[spec.mnemonic.toLowerCase()];
    var after = this._after;

    var internals = {};

    return function (cpu, done) {

        [before, instFn, after].forEach(function (fn) {

            if (fn === before) debug('run before execute hook');
            else if (fn === undefined) {
                debug('%s not implemented. stop', spec.mnemonic);
                process.exit(1);
            }
            else if (fn === instFn) {
                debug('execute %s %s', spec.mnemonic, spec.operands);
            }
            else if (fn === after) debug('run after execute hook');

            // Run step

            var res = fn.call(internals, spec, cpu);
            if (res === undefined && fn === instFn) {
                debug('instruction returned \'undefined\'. stop');
                process.exit(1);
            }
        });
        return done();
    }
};

module.exports = Runner;

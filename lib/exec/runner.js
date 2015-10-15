'use strict';

var debug = require('debug')('runner');
var fetch = require('./fetcher');


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
    if (this._insts[mnemonic.toLowerCase()]) {
        throw new Error(mnemonic + ' instruction cannot be redeclared');
    }
    this._insts[mnemonic.toLowerCase()] = fn;
};

var prebake = function (spec) {

    var before = this._before;
    var instFn = this._insts[spec.mnemonic.toLowerCase()];
    var after = this._after;

    var internals = {};

    return function (cpu, done) {

        [before, instFn, after].forEach(function (fn) {

            if (fn === before) {
                debug('before execute');
                fn = fn.bind(internals, spec, cpu);
            }
            else if (fn === undefined) {
                debug('%s not implemented. stop', spec.mnemonic);
                process.exit(1);
            }
            else if (fn === instFn) {
                debug('run %s %s', spec.mnemonic, spec.operands);

                // Fetch Operands

                var op1 = fetch(cpu, spec.operands, 0);
                var op2 = fetch(cpu, spec.operands, 1);

                fn = fn.bind(internals, op1, op2, cpu);
            }
            else if (fn === after) {
                debug('after execute');
                fn = fn.bind(internals, spec, cpu);
            }

            // Run step

            if (fn() === undefined && fn === instFn) {
                debug('instruction returned \'undefined\'. stop');
                process.exit(1);
            }
        });

        return done();
    }
};

module.exports = Runner;

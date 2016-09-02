'use strict';

const debug = require('debug')('cpu');
const cycle = require('debug')('cpu:cycle');
const instructions = require('./instructions');
const Timer = require('./timer');
const Lcd = require('./lcd');


class Cpu {
    constructor (mmu) {
        this._mmu = mmu;
        this._timer = new Timer(this._mmu);
        this._lcd = new Lcd();

        // Interrupt Master Enable

        this._ime = 0;

        // 8-bit registers

        this._a = 0; this._f = 0;
        this._b = 0; this._c = 0;
        this._d = 0; this._e = 0;
        this._h = 0; this._l = 0;

        // 16-bit registers

        this._sp = 0;
        this._pc = 0;
    }

    // 8-bit registers

    get a () { return this._a; }
    get f () { return this._f; }
    get b () { return this._b; }
    get c () { return this._c; }
    get d () { return this._d; }
    get e () { return this._e; }
    get h () { return this._h; }
    get l () { return this._l; }

    set a (v) { this._a = v & 0xff; }
    set f (v) { this._f = v & 0xff; }
    set b (v) { this._b = v & 0xff; }
    set c (v) { this._c = v & 0xff; }
    set d (v) { this._d = v & 0xff; }
    set e (v) { this._e = v & 0xff; }
    set h (v) { this._h = v & 0xff; }
    set l (v) { this._l = v & 0xff; }

    // Paired 8-bit registers

    get af () { return this._a << 8 | this._f; }
    get bc () { return this._b << 8 | this._c; }
    get de () { return this._d << 8 | this._e; }
    get hl () { return this._h << 8 | this._l; }

    set af (v) { this._a = v >> 8; this._f = v & 0xff; }
    set bc (v) { this._b = v >> 8; this._c = v & 0xff; }
    set de (v) { this._d = v >> 8; this._e = v & 0xff; }
    set hl (v) { this._h = v >> 8; this._l = v & 0xff; }

    // 16-bit registers

    get sp () { return this._sp; }
    get pc () { return this._pc; }

    set sp (v) { this._sp = v & 0xffff; }
    set pc (v) { this._pc = v & 0xffff; }

    powerOn () {
        debug('power on');
        setInterval(() => this._step(), 1000 / 60);
    }

    _step () {
        const MAX_CYCLES = 69905;
        let cycles = 0;

        while (cycles < MAX_CYCLES) {
            cycles += this._runCycle();
            this._timer.step(cycles);
            this._lcd.step(cycles);
        }
        debug('render');
    }

    _runCycle () {
        let prefix = '';
        let opcode = this._mmu.readByte(this.pc);
        let set = instructions.$;

        if (opcode == 0xcb) {
            prefix = opcode;
            opcode = this._mmu.readByte(this.pc + 1);
            set = instructions.$[prefix];
        }

        const inst = set[opcode];
        if (!inst) {
            const v = `${prefix.toString(16)}${opcode.toString(16)}`;
            throw new Error(`unknown opcode 0x${v}`);
        }
        cycle('%s; $%s', inst[0], this.pc.toString(16));

        return inst[1](this, this._mmu);
    }
}

module.exports = Cpu;

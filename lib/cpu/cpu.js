'use strict';

const debug = require('debug')('gameboy:cpu');
const cycle = require('debug')('gameboy:cpu:cycle');
const int = require('debug')('gameboy:cpu:int');
const raf = require('raf');
const opcodes = require('./opcodes');
const Serializable = require('../util/serializable');
const { INT_40, INT_48, INT_50, INT_58, INT_60 } = require('../interrupts');

const MAX_FRAME_CYCLES = 69905;

const exclude = [
    '_mmu',
    '_timer',
    '_lcd',
    '_loop'
];

class Cpu extends Serializable({ exclude }) {
    constructor (mmu, timer, lcd) {
        super();
        this._mmu = mmu;
        this._timer = timer;
        this._lcd = lcd;

        // Gameloop

        this._loop = null;

        // Interrupt Master Enable

        this.ime = false;

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
    set f (v) { this._f = v & 0xf0; }
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

    set af (v) { this.a = v >> 8; this.f = v; }
    set bc (v) { this.b = v >> 8; this.c = v; }
    set de (v) { this.d = v >> 8; this.e = v; }
    set hl (v) { this.h = v >> 8; this.l = v; }

    // 16-bit registers

    get sp () { return this._sp; }
    get pc () { return this._pc; }

    set sp (v) { this._sp = v & 0xffff; }
    set pc (v) { this._pc = v & 0xffff; }

    init () {
        this.ime = false;

        this._a = 0; this._f = 0;
        this._b = 0; this._c = 0;
        this._d = 0; this._e = 0;
        this._h = 0; this._l = 0;

        this._sp = 0;
        this._pc = 0;
    }

    start () {
        debug('start');

        const tick = () => {
            this._step();
            this._loop = raf(tick);
        };
        this._loop = raf(tick);
    }

    stop () {
        debug('stop');
        raf.cancel(this._loop);
    }

    _step () {
        let frameCycles = 0;
        let t = 0;

        while (frameCycles < MAX_FRAME_CYCLES) {
            const cycles = this._runCycle() + t;
            this._timer.step(cycles);
            this._lcd.step(cycles);
            t = this._handleInterrupts();
            frameCycles += cycles;
        }
    }

    _runCycle () {
        let opcode = this._mmu.readByte(this._pc);
        let insts = opcodes.$;

        if (opcode == 0xcb) {
            opcode = this._mmu.readByte(this._pc + 1);
            insts = opcodes.$[0xcb];
        }
        const [mnemonic, fn] = insts[opcode];

        cycle('%s; $%s', mnemonic, this._pc.toString(16));
        return fn(this, this._mmu);
    }

    _handleInterrupts () {
        /**
         * IME - Interrupt Master Enable Flag (Write Only)
         *
         * 0 - Disable all Interrupts
         * 1 - Enable all Interrupts that are enabled in IE Register (FFFF)
         */
        if (!this.ime) return 0;

        const flags = this._mmu.ie & this._mmu.if;
        if (flags == 0) return 0;

        int('flags 0b%s', flags.toString(2));

        let addr;
        if (flags & INT_40) { this._mmu.if &= ~INT_40; addr = 0x40; }
        else if (flags & INT_48) { this._mmu.if &= ~INT_48; addr = 0x48; }
        else if (flags & INT_50) { this._mmu.if &= ~INT_50; addr = 0x50; }
        else if (flags & INT_58) { this._mmu.if &= ~INT_58; addr = 0x58; }
        else if (flags & INT_60) { this._mmu.if &= ~INT_60; addr = 0x60; }

        this.ime = false;

        this._mmu.writeWord(this._sp -= 2, this._pc);
        this._pc = addr;

        return 20;
    }
}

module.exports = Cpu;

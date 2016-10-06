'use strict';

const debug = require('debug')('cpu');
const cycle = require('debug')('cpu:cycle');
const int = require('debug')('cpu:int');
const raf = require('raf');
const { IE, IF } = require('./registers');
const { INT_40, INT_48, INT_50, INT_58, INT_60 } = require('./interrupts');
const opcodes = require('./opcodes');
const Timer = require('./timer');

const MAX_CYCLES = 70224;


class Cpu {
    constructor (mmu, gpu) {
        this._mmu = mmu;
        this._gpu = gpu;

        // Timers

        this._timer = new Timer(this._mmu);

        // Interrupt Master Enable

        this.ime = 0;

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

    set af (v) { this.a = v >> 8; this.f = v; }
    set bc (v) { this.b = v >> 8; this.c = v; }
    set de (v) { this.d = v >> 8; this.e = v; }
    set hl (v) { this.h = v >> 8; this.l = v; }

    // 16-bit registers

    get sp () { return this._sp; }
    get pc () { return this._pc; }

    set sp (v) { this._sp = v & 0xffff; }
    set pc (v) { this._pc = v & 0xffff; }

    powerOn () {
        debug('power on');

        const tick = () => {
            this._step();
            raf(tick);
        };
        raf(tick);
    }

    _step () {
        let frameCycles = 0;

        while (frameCycles < MAX_CYCLES) {
            const cycles = this._runCycle();
            this._timer.step(cycles);
            this._gpu.step(cycles);
            this._handleInterrupts();
            frameCycles += cycles;
        }
        this._gpu.render();
    }

    _runCycle () {
        let prefix = '';
        let opcode = this._mmu.readByte(this._pc);
        let insts = opcodes.$;

        if (opcode == 0xcb) {
            prefix = opcode;
            opcode = this._mmu.readByte(this._pc + 1);
            insts = opcodes.$[prefix];
        }

        const inst = insts[opcode];
        if (!inst) {
            const v = `${prefix.toString(16)}${opcode.toString(16)}`;
            const addr = this._pc.toString(16);
            throw new Error(`unknown opcode 0x${v}; $${addr}`);
        }
        cycle('%s; $%s', inst[0], this._pc.toString(16));

        return inst[1](this, this._mmu);
    }

    _handleInterrupts () {
        /**
         * IME - Interrupt Master Enable Flag (Write Only)
         *
         * 0 - Disable all Interrupts
         * 1 - Enable all Interrupts that are enabled in IE Register (FFFF)
         */
        if (this.ime == 0) return;

        const ie = this._mmu.readByte(IE);
        if (ie == 0) return;

        let intf = this._mmu.readByte(IF);
        if (intf == 0) return;

        const flags = ie & intf;

        let addr;
        if (flags == 0) return;
        else if (flags & INT_40) { intf &= ~INT_40; addr = 0x40; }
        else if (flags & INT_48) { intf &= ~INT_48; addr = 0x48; }
        else if (flags & INT_50) { intf &= ~INT_50; addr = 0x50; }
        else if (flags & INT_58) { intf &= ~INT_58; addr = 0x58; }
        else if (flags & INT_60) { intf &= ~INT_60; addr = 0x60; }

        int('flags 0b%s', flags.toString(2));

        this._mmu.writeWord(this._sp -= 2, this._pc);
        this._mmu.writeByte(IF, intf);

        this._pc = addr;
        this.ime = 0;
    }
}

module.exports = Cpu;

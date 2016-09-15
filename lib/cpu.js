'use strict';

const debug = require('debug')('cpu');
const cycle = require('debug')('cpu:cycle');
const int = require('debug')('cpu:int');
const instructions = require('./instructions');
const NanoTimer = require('nanotimer');
const Timer = require('./timer');
const Lcd = require('./lcd');

const MAX_CYCLES = 70224;

/**
 * FF0F - IF - Interrupt Flag (R/W)
 *
 * Bit 0: V-Blank  Interrupt Request (INT 40h)  (1=Request)
 * Bit 1: LCD STAT Interrupt Request (INT 48h)  (1=Request)
 * Bit 2: Timer    Interrupt Request (INT 50h)  (1=Request)
 * Bit 3: Serial   Interrupt Request (INT 58h)  (1=Request)
 * Bit 4: Joypad   Interrupt Request (INT 60h)  (1=Request)
 */
const IF = 0xff0f;

/**
 * FFFF - IE - Interrupt Enable (R/W)
 *
 * Bit 0: V-Blank  Interrupt Enable  (INT 40h)  (1=Enable)
 * Bit 1: LCD STAT Interrupt Enable  (INT 48h)  (1=Enable)
 * Bit 2: Timer    Interrupt Enable  (INT 50h)  (1=Enable)
 * Bit 3: Serial   Interrupt Enable  (INT 58h)  (1=Enable)
 * Bit 4: Joypad   Interrupt Enable  (INT 60h)  (1=Enable)
 */
const IE = 0xffff;


class Cpu {
    constructor (mmu, gpu) {
        this._mmu = mmu;
        this._gpu = gpu;

        this._loop = new NanoTimer();

        // Timers

        this._timer = new Timer(this._mmu);
        this._lcd = new Lcd(this._mmu, this._gpu);

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
        this._loop.setInterval(() => this._step(), '', '16ms');
    }

    _step () {
        let frameCycles = 0;

        while (frameCycles < MAX_CYCLES) {
            const cycles = this._runCycle();
            this._timer.step(cycles);
            this._lcd.step(cycles);
            this._handleInterrupts();
            frameCycles += cycles;
        }
        this._gpu.render();
    }

    _handleInterrupts () {
        /**
         * IME - Interrupt Master Enable Flag (Write Only)
         *
         * 0 - Disable all Interrupts
         * 1 - Enable all Interrupts that are enabled in IE Register (FFFF)
         */
        if (this.ime == 0) return;

        const ie = this._mmu.readWord(IE);
        if (ie == 0) return;

        let intf = this._mmu.readWord(IF);
        let addr;

        int('flags 0b%s', intf.toString(2));

        if (ie & intf & 1) { intf &= ~1; addr = 0x40; }
        else if (ie & intf & 2) { intf &= ~(1 << 1); addr = 0x48; }
        else if (ie & intf & 3) { intf &= ~(1 << 2); addr = 0x50; }
        else if (ie & intf & 4) { intf &= ~(1 << 3); addr = 0x58; }
        else if (ie & intf & 5) { intf &= ~(1 << 4); addr = 0x60; }
        else return;

        this._mmu.writeWord(this._sp -= 2, this._pc);
        this._mmu.writeByte(IF, intf);

        this._pc = addr;
        this.ime = 0;
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
            const addr = this._pc.toString(16);
            throw new Error(`unknown opcode 0x${v}; $${addr}`);
        }
        cycle('%s; $%s', inst[0], this.pc.toString(16));

        return inst[1](this, this._mmu);
    }
}

module.exports = Cpu;

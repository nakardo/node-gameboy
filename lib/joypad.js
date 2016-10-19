'use strict';

const debug = require('debug')('joypad');
const { INT_60 } = require('./interrupts');


class Joypad {
    constructor (mmu) {
        this._mmu = mmu;
        this._keys = {};

        // Registers

        this._select = 0;
        this._joyp = [0xf, 0xf];
    }

    keyDown (code) {
        debug('keydown %d', code);

        this._keys[code] = true;
        this._update();
    }

    keyUp (code) {
        debug('keyup %d', code);

        this._keys[code] = false;
        this._update();
    }

    /**
     * FF00 - P1/JOYP - Joypad (R/W)
     *
     * The eight gameboy buttons/direction keys are arranged in form of a 2x4
     * matrix. Select either button or direction keys by writing to this
     * register, then read-out bit 0-3.
     *
     * Bit 7 - Not used
     * Bit 6 - Not used
     * Bit 5 - P15 Select Button Keys      (0=Select)
     * Bit 4 - P14 Select Direction Keys   (0=Select)
     * Bit 3 - P13 Input Down  or Start    (0=Pressed) (Read Only)
     * Bit 2 - P12 Input Up    or Select   (0=Pressed) (Read Only)
     * Bit 1 - P11 Input Left  or Button B (0=Pressed) (Read Only)
     * Bit 0 - P10 Input Right or Button A (0=Pressed) (Read Only)
     */

    readByte (addr) {
        if (addr == 0xff00) {
            return this._joyp[this._select];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        if (addr == 0xff00) {
            switch (val & 0x30) {
                case 0x10: this._select = 0; break; // button keys
                case 0x20: this._select = 1; break; // direction keys
            }
            return this._joyp[this._select];
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    _update () {
        this._joyp = [0xf, 0xf];

        if (this._keys[40]) this._joyp[1] &= ~8; // down
        if (this._keys[13]) this._joyp[0] &= ~8; // start
        if (this._keys[38]) this._joyp[1] &= ~4; // up
        if (this._keys[32]) this._joyp[0] &= ~4; // select
        if (this._keys[37]) this._joyp[1] &= ~2; // left
        if (this._keys[83]) this._joyp[0] &= ~2; // b
        if (this._keys[39]) this._joyp[1] &= ~1; // right
        if (this._keys[65]) this._joyp[0] &= ~1; // a

        this._mmu.if |= INT_60;
    }
}

module.exports = Joypad;

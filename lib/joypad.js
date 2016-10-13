'use strict';

const debug = require('debug')('joypad');
const { INT_60 } = require('./interrupts');
const { JOYP, IF } = require('./registers');


class Joypad {
    constructor (mmu) {
        this._mmu = mmu;
        this._keys = {};

        // Registers

        this._mmu.joypad = this;

        this._select = 0;
        this._joyp = [0xf, 0xf];
    }

    keyDown (code) {
        debug('keydown %d', code);

        this._keys[code] = true;
        this._update();

        this._mmu.writeByte(IF, this._mmu.readByte(IF) | INT_60);
    }

    keyUp (code) {
        debug('keyup %d', code);

        this._keys[code] = false;
        this._update();
    }

    readByte (addr) {
        if (addr == JOYP) return this._joyp[this._select];
        return 0;
    }

    writeByte (addr, val) {
        if (addr == JOYP) {
            switch (val & 0x30) {
                case 0x10: this._select = 0; break; // button keys
                case 0x20: this._select = 1; break; // direction keys
            }
            return this._joyp[this._select];
        }

        return val;
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
    }
}

module.exports = Joypad;

'use strict';

const debug = require('debug')('joypad');
const { JOYP } = require('./registers');


class Joypad {
    constructor (mmu) {
        this._mmu = mmu;

        // Registers

        this._mmu.joypad = this;

        this._joyp = 0;
    }

    keyDown (event) {
        debug('key down %d', event.keyCode);

        this._joyp = 0x3f;
        switch (event.keyCode) {
            case 37: this._joyp &= ~0x10; this._joyp &= ~2; break; // left
            case 38: this._joyp &= ~0x10; this._joyp &= ~4; break; // up
            case 39: this._joyp &= ~0x10; this._joyp &= ~1; break; // right
            case 40: this._joyp &= ~0x10; this._joyp &= ~8; break; // bottom
            case 65: this._joyp &= ~0x20; this._joyp &= ~1; break; // a
            case 83: this._joyp &= ~0x20; this._joyp &= ~2; break; // b
            default: return debug('unknown key');
        }

        debug('joypad 0b%s', this._joyp.toString(2));
    }

    keyUp (event) {
        debug('key up %d', event.keyCode);
        this._joyp |= 0xf;
    }

    readByte (addr) {
        if (addr == JOYP) return this._joyp;
        return 0;
    }

    writeByte (addr, val) {
        if (addr == JOYP) return this._joyp |= val & 0xf0;
        return val;
    }
}

module.exports = Joypad;

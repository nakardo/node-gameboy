'use strict';

require('./number');

const render = require('debug')('gpu:render');
const control = require('debug')('gpu:control');
const EventEmitter = require('events').EventEmitter;
const Canvas = require('./canvas');
const { LCDC, SCY, SCX, BGP } = require('./registers');

const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;


class Gpu extends EventEmitter {
    constructor (mmu) {
        super();
        this._mmu = mmu;

        // Registers

        this._lcdc = 0;
        this._scy = 0;
        this._scx = 0;
        this._bgp = 0;

        // Canvas

        this._canvas = new Canvas(FRAME_WIDTH, FRAME_HEIGHT);
        this._ctx = this._canvas.getContext('2d');
        this._image = this._ctx.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        this._data = this._image.data;
    }

    readByte (addr) {
        switch (addr) {
            case LCDC: return this._lcdc;
            case SCY: return this._scy;
            case SCX: return this._scx;
            case BGP: return this._bgp;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    writeByte (addr, val) {
        switch (addr) {
            case LCDC: return this._lcdc = val;
            case SCY: return this._scy = val;
            case SCX: return this._scx = val;
            case BGP: return this._bgp = val;
        }

        throw new Error(`unmapped address 0x${addr.toString(16)}`);
    }

    drawLine (line) {

    }

    render () {
        render('frame');

        // LCD Display Enable

        control('%s', this._lcdc.toString(2));
    }
}

module.exports = Gpu;

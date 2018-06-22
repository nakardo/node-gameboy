'use strict';

const Video = require('./gpu/video');
const Timer = require('./cpu/timer');
const Lcd = require('./gpu/lcd');
const Mmu = require('./mmu');
const Gpu = require('./gpu/gpu');
const Cpu = require('./cpu/cpu');
const Cart = require('./cart/cart');
const Joypad = require('./joypad');
const Serializable = require('./util/serializable');


const exclude = [
    '_joypad',
    '_useBios',
    '_isRunning'
];

class Gameboy extends Serializable({ exclude }) {
    constructor (bios = null) {
        super();
        const mmu = new Mmu(bios);

        const video = new Video();
        const gpu = new Gpu(video);
        const timer = new Timer(mmu);
        const lcd = new Lcd(mmu, gpu);
        const cpu = new Cpu(mmu, timer, lcd);
        const joypad = new Joypad(mmu);

        this._video = video;
        this._timer = timer;
        this._lcd = lcd;
        this._mmu = mmu;
        this._gpu = gpu;
        this._cpu = cpu;
        this._joypad = joypad;

        // Mappings

        mmu.video = video;
        mmu.timer = timer;
        mmu.lcd = lcd;
        mmu.gpu = gpu;
        mmu.joypad = joypad;

        // Use Bootstrap

        this._useBios = bios != null && bios.length > 0;

        // Gameloop

        this._isRunning = false;
    }

    get gpu () {
        return this._gpu;
    }

    get joypad () {
        return this._joypad;
    }

    loadCart (buffer) {
        this._isRunning = false;
        this._cpu.stop();
        this._mmu.loadCart(new Cart(buffer));
    }

    get cart () {
        return this._mmu.cart;
    }

    start () {
        this._isRunning = true;
        this._init();
        this._cpu.start();
    }

    pauseResume () {
        this._isRunning = !this._isRunning;
        if (this._isRunning) this._cpu.start();
        else this._cpu.stop();
    }

    reset () {
        this._isRunning = false;
        this._cpu.stop();
        this.start();
    }

    _init () {
        this._timer.init();
        this._lcd.init();
        this._mmu.init();
        this._cpu.init();

        if (!this._useBios) {
            this._cpu.pc = 0x100;
            this._cpu.af = 0x1b0;
            this._cpu.bc = 0x13;
            this._cpu.de = 0xd8;
            this._cpu.hl = 0x14d;
            this._cpu.sp = 0xfffe;

            this._mmu.writeByte(0xff05, 0x00); // TIMA
            this._mmu.writeByte(0xff06, 0x00); // TMA
            this._mmu.writeByte(0xff07, 0x00); // TAC
            this._mmu.writeByte(0xff10, 0x80); // NR10
            this._mmu.writeByte(0xff11, 0xbf); // NR11
            this._mmu.writeByte(0xff12, 0xf3); // NR12
            this._mmu.writeByte(0xff14, 0xbf); // NR14
            this._mmu.writeByte(0xff16, 0x3f); // NR21
            this._mmu.writeByte(0xff17, 0x00); // NR22
            this._mmu.writeByte(0xff19, 0xbf); // NR24
            this._mmu.writeByte(0xff1a, 0x7f); // NR30
            this._mmu.writeByte(0xff1b, 0xff); // NR31
            this._mmu.writeByte(0xff1c, 0x9f); // NR32
            this._mmu.writeByte(0xff1e, 0xbf); // NR33
            this._mmu.writeByte(0xff20, 0xff); // NR41
            this._mmu.writeByte(0xff21, 0x00); // NR42
            this._mmu.writeByte(0xff22, 0x00); // NR43
            this._mmu.writeByte(0xff23, 0xbf); // NR30
            this._mmu.writeByte(0xff24, 0x77); // NR50
            this._mmu.writeByte(0xff25, 0xf3); // NR51
            this._mmu.writeByte(0xff26, 0xf1); // NR52
            this._mmu.writeByte(0xff40, 0x91); // LCDC
            this._mmu.writeByte(0xff42, 0x00); // SCY
            this._mmu.writeByte(0xff43, 0x00); // SCX
            this._mmu.writeByte(0xff45, 0x00); // LYC
            this._mmu.writeByte(0xff47, 0xfc); // BGP
            this._mmu.writeByte(0xff48, 0xff); // OBP0
            this._mmu.writeByte(0xff49, 0xff); // OBP1
            this._mmu.writeByte(0xff4a, 0x00); // WY
            this._mmu.writeByte(0xff4b, 0x00); // WX
            this._mmu.writeByte(0xffff, 0x00); // IE
        }
    }
}

Gameboy.version = '__VERSION__';

module.exports = Gameboy;

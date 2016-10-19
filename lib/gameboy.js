'use strict';

const debug = require('debug');
const Video = require('./video');
const Timer = require('./timer');
const Lcd = require('./lcd');
const Mmu = require('./mmu');
const Gpu = require('./gpu');
const Cpu = require('./cpu');
const Joypad = require('./joypad');


class Gameboy {
    constructor (rom, bios) {
        const mmu = new Mmu(rom, bios);

        const video = new Video();
        const gpu = new Gpu(video);
        const timer = new Timer(mmu);
        const lcd = new Lcd(mmu, gpu);
        const cpu = new Cpu(mmu, gpu, timer, lcd);
        const joypad = new Joypad(mmu);

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

        this._useBios = bios && bios.length > 0;
    }

    get gpu () { return this._gpu; }
    get joypad () { return this._joypad; }

    powerOn () {
        debug('power on');

        if (!this._useBios) {
            debug('no bios');

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

        this._cpu.start();
    }
}

module.exports = Gameboy;

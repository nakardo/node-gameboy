'use strict';

var debug = require('debug')('lcd');


function Lcd(cpu, mmu) {

    this._cpu = cpu;
    this._mmu = mmu;
}

Lcd.prototype.powerOn = function () {
    debug('power on');
};

Lcd.prototype.step = function (cycles) {
    // body...
};

module.exports = Lcd;

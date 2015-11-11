'use strict';

var debug = require('debug')('lcd');


function Lcd() {
}

Lcd.prototype.powerOn = function () {
    debug('power on');
};

Lcd.prototype.step = function (cycles) {
    // body...
};

module.exports = Lcd;

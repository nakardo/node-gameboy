var debug = require('debug')('gpu');


function Gpu() {

    // Memory map
    //
    // [8000-9FFF]
    //
    // Graphics RAM: Data required for the backgrounds and sprites used by the
    // graphics subsystem is held here, and can be changed by the cartridge
    // program. This region will be examined in further detail in part 3 of this
    // series.
    //
    // [FE00-FE9F]
    //
    // Graphics: sprite information: Data about the sprites rendered by the
    // graphics chip are held here, including the sprites' positions and
    // attributes.

    this._vram = null;
    this._oam = null;
}

Gpu.prototype.powerOn = function () {

    debug('power on');

    this._vram = new Uint8Array(0x1FFF);
    this._oam = new Uint8Array(0x9F);
};

module.exports = Gpu;

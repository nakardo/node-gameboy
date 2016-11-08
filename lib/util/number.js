'use strict';

Number.prototype.signed = function () {
    return this & 0x80 ? -((0xff & ~this) + 1) : this;
};

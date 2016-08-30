'use strict';

const bit = (val = 0) => ({
    val,
    s: function (bit, condition = true) {
        if (condition) this.val |= 1 << bit;
        return this;
    },
    r: function (bit, condition = true) {
        if (condition) this.val &= ~(1 << bit);
        return this;
    },
    t: function (bit) {
        return (this.val >> bit) & 1;
    }
});

module.exports = bit;

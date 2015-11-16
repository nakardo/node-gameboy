'use strict';

var assert = require('assert');


exports.set = function (word, bit) {

    assert(typeof word === 'number', 'word must be a number');
    assert(typeof bit === 'number', 'bit must be a number');

    return word |= (1 << bit);
};

exports.reset = function (word, bit) {

    assert(typeof word === 'number', 'word must be a number');
    assert(typeof bit === 'number', 'bit must be a number');

    return word &= ~(1 << bit);
};

exports.test = function (word, bit) {

    assert(typeof word === 'number', 'word must be a number');
    assert(typeof bit === 'number', 'bit must be a number');

    return (word & 1 << bit) > 0 ? 1 : 0;
};

exports.signed = function (word, mask) {

    assert(typeof word === 'number', 'word must be a number');
    assert(typeof mask === 'number', 'mask must be a number');

    return word > Math.floor(mask / 2) ? -((~word + 1) & mask) : word;
}

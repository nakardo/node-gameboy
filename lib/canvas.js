'use strict';

function Canvas (width = 160, height = 144) {
    if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return canvas;
    }

    return new (require('canvas'))(width, height);
}

module.exports = Canvas;

'use strict';

function Canvas (width, height) {
    if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return canvas;
    }

    return new (require('canvas'))(width, height);
}

module.exports = Canvas;

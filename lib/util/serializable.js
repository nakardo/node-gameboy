'use strict';

const Serializable = (opts = {}, T = class {}) => class extends T {

    toJSON () {
        const { exclude, include } = opts;

        let exp = () => false;
        if (exclude) exp = (v) => exclude.indexOf(v) < 0;
        if (include) exp = (v) => include.indexOf(v) > -1;

        return Object
            .keys(this)
            .filter(exp)
            .reduce((p, c) => {
                p[c] = this[c];
                return p;
            }, {});
    }
};

module.exports = Serializable;

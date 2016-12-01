'use strict';

const Serializable = (opts = {}, T = class {}) => class extends T {

    toJSON () {
        const { exclude, include } = opts;

        let exp = () => true;
        if (exclude) exp = (v) => exclude.indexOf(v) < 0;
        if (include) exp = (v) => include.indexOf(v) > -1;

        return Object
            .keys(this)
            .filter(exp)
            .reduce((obj, key) => {
                let value;

                const prop = this[key];
                if ('object' == typeof prop) {
                    if ('function' == typeof prop.toJSON) {
                        value = prop.toJSON();
                    } else if ('Uint8Array' == prop.constructor.name) {
                        value = Array.from(this[key]);
                    }
                }
                else value = this[key];

                obj[key] = value;
                return obj;
            }, {});
    }

    fromJSON (obj) {
        Object
            .keys(obj)
            .filter((v) => this.hasOwnProperty(v))
            .forEach((k) => {
                const p = this[k];
                if ('object' == typeof p && p.fromJSON) p.fromJSON(obj[k]);
                else this[k] = obj[k];
            });
    }
};

module.exports = Serializable;

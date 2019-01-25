import addEventsMethods from '../utils/events-methods';

export class ReactiveObject {

    constructor(data) {

        let values = {};

        for (let p in data) {

            // Handle nested objects.
            if (data.hasOwnProperty(p)) {

                Object.defineProperty(this, p, {
                    enumerable: true,
                    get() {
                        return values[p];
                    },
                    set(value) {
                        this.triggerEvent('change', p, values[p], value);
                        if (typeof data[p] === 'object') {
                            if (Array.isArray(data[p])) {
                                values[p] = new ReactiveObject(value);
                                values[p].on('change', (prop, oldValue, newValue) => {
                                    this.triggerEvent('change', p, oldValue, newValue);
                                });
                            } else {
                                values[p] = new ReactiveObject(value);
                                values[p].on('change', (prop, oldValue, newValue) => {
                                    this.triggerEvent('change', p, oldValue, newValue);
                                });
                            }

                        } else {
                            values[p] = value;
                        }
                    }
                });

                this[p] = data[p];
            }
        }
    }
}
ReactiveObject.prototype = {constructor: Object};
addEventsMethods(ReactiveObject.prototype);



export class ReactiveArray {

    constructor() {
        let values = [];
    }
}
ReactiveObject.prototype = {
    constructor: Array,
    toString() {return '[object Array]';}
};
addEventsMethods(ReactiveArray.prototype);
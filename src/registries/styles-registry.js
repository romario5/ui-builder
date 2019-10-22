import {error} from '../utils/logging';

/**
 * Holds all registered styles.
 * The key is namespace including UI name and value is
 * an object with styles.
 */
let styles = {};



let stylesRegistry = {
    add(namespace, stylesObj) {
        if (styles.hasOwnProperty(namespace)) {
            error('Styles with namespace ' + namespace + ' already exists.');
            return;
        }
        styles[namespace] = stylesObj;
    },

    get(namespace) {
        return styles.hasOwnProperty(namespace) ? styles[namespace] : {};
    }
};


export default stylesRegistry;


import UI from './core/ui';
import Instance from './core/instance';
import Element from './core/element';
import uiRegistry from './registries/ui-registry';
import addEventsMethods from './utils/events-methods';
import {checkUIParameters} from './utils/ui-utils';
import createResetStyles from './core/reset-styles';

/**
 * Main function/object-helper that contains all methods
 * of the application.
 * @param name {string} Name of the UI.
 * @returns {UI|null}
 */
export default function Builder(name) {
    return uiRegistry.get(name);
}

// Add events support.
addEventsMethods(Builder);

/**
 * Registers new UI.
 * @param data (object)
 *
 * Structure:
 * {
 *      name         : {string},
 *      localization : {string},
 *      translations : {object},
 *      scheme       : {object},
 *      rules        : {object},
 *      params       : {object},
 *      method       : {object},
 *      styles       : {object}
 * }
 */
Builder.register = function(data) {
    if(typeof data === 'string'){
        data = {name : data};
    }
    checkUIParameters(data);
    let ui = new UI(data);
    uiRegistry.add(data.name, ui);
    Builder.triggerEvent('register', ui);
    return ui;
};

/**
 * Checks whether subject is instance of the UI.
 * @param subject
 * @returns {boolean}
 */
Builder.isInstance = function(subject){
    return subject instanceof Instance;
};

/**
 * Checks whether subject is element of the UI instance.
 * @param subject
 * @returns {boolean}
 */
Builder.isElement = function(subject){
    return subject instanceof Element;
};

// Attach helpers.
Builder.createResetStyles = createResetStyles;

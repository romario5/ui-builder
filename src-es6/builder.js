import UI from './core/ui';
import UIInstance from './core/instance';
import UIElement from './core/element';
import uiRegistry from './registries/ui-registry';
import eventsImplementation from './helpers/events-implementation';
import {checkUIParameters} from './helpers/ui-utils';



/**
 * Exported function.
 * @param {string} name Name of the UI.
 * @return {UI|null}
 */
export default function Builder(name) {
    return uiRegistry.get(name);
}


/**
 * Add events support for the UIBuilder.
 */
eventsImplementation.call(Builder);



/**
 * Registers new UI.
 * @param data (object)
 * {
 *      name   : (string),
 *      scheme : (object),
 *      rules  : (object)
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
 * Reset styles.
 * @type {{}}
 */
let resetStyles = {};


/**
 * Generates reset styles.
 * Can be used after theme definition to include dynamically defined styles.
 *
 * Example:
 *
 * // Define theme.
 * Theme.register('Default', {
 *     colors : {
 *         primary: new Color('#ff0000)
 *     }
 * });
 *
 * // Set current theme.
 * Theme.switchTo('Default');
 *
 * // Add reset styles and render it.
 * UI.createResetStyles({
 *     button : {
 *         backgroundColor: Theme('colors.primary')
 *     }
 * });
 *
 * // Force to re-render reset styles on theme switch.
 * Theme.on('switch', UI.createResetStyles);
 */
Builder.createResetStyles = function(styles)
{
    if(styles === undefined){
        styles = resetStyles;
    }else{
        resetStyles = styles;
    }

    let styleTag = document.querySelector('style[data-reset="ui-builder"]');
    if(styleTag === null){
        styleTag = document.createElement('style');
        styleTag.setAttribute('data-reset', 'ui-builder');
        let head = document.getElementsByTagName('head')[0];
        head.appendChild(styleTag);
    }



    // Set new content of the reset style tag.
    styleTag.innerHTML = css;
};



/**
 * Checks whether subject is instance of the UI.
 * @param subject
 * @returns {boolean}
 */
Builder.isInstance = function(subject){
    return subject instanceof UIInstance;
};



/**
 * Checks whether subject is element of the UI instance.
 * @param subject
 * @returns {boolean}
 */
Builder.isElement = function(subject){
    return subject instanceof UIElement;
};
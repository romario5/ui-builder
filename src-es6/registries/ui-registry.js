// Registry that stores registered UI.
// This registry additionally resolves extendings.

import extendingsRegistry from './extendings-registry';

/**
 * Private variable that holds registered UIs as properties where property name is an UI name.
 * @type {{UI}}
 * @private
 */
let _uis = {};


let uiRegistry = {
    /**
     * Adds UI with the given name to the registry.
     * @param {string} name
     * @param {UI} ui
     */
    add (name, ui) {
        _uis[name] = ui;
    },


    /**
     * Returns UI by name if it's already registered.
     * If UI is not registered yet - null will be returned.
     * @param name
     * @returns {UI|null}
     */
    get (name) {
        let ui = _uis.hasOwnProperty(name) ? _uis[name] : null;
        if(ui === null){
            let extending = extendingsRegistry.get(name);
            if(extending !== null){
                _uis[name] = extending.extend();
                extendingsRegistry.delete(name);
                return _uis[name];
            }
        }
        return null;
    }
};

export default uiRegistry;

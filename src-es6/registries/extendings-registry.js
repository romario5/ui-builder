// Registry that stores registered UIExtending.
// Don't implement any other logic here cause this file is just a simple storage.

/**
 * Private variable that holds registered UIs as properties where property name is an UI name.
 * @type {{UI}}
 * @private
 */
let _extendings = {};


let extendingsRegistry = {
    /**
     * Adds UI with the given name to the registry.
     * @param {string} name
     * @param {UIExtending} extending
     */
    add (name, extending) {
        _extendings[name] = extending;
    },


    /**
     * Returns UIExtending by name if it's already registered.
     * If UIExtending is not registered yet - null will be returned.
     * @param name
     * @returns {null}
     */
    get (name) {
        return _extendings.hasOwnProperty(name) ? _extendings[name] : null;
    },


    /**
     * Deletes UIExtending with the given name.
     * @param name
     */
    delete (name) {
        delete _extendings[name];
    }
};


export default extendingsRegistry;

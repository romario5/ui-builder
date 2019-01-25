import addEventsMethods from '../utils/events-methods';
import {cloneSimpleObject} from '../utils/object-utils';
import {error} from '../utils/logging';

/**
 * Class that represents single extension.
 *
 * @property name    {string}
 * @property options {object}
 *
 * @method on(eventName, handler)
 * @method off(eventName, handler)
 * @method triggerEvent(eventName, [args...])
 */
class Extension
{
    constructor(name, options) {
        if (options === undefined) options = {};

        this.name = name;
        this.params = options.params || {};

        // Add properties to store events handlers.
        this.__ = {
            events: {},
            eventsTimeouts: {},
            dispatchers: {}
        };

        // Add events listeners from properties that begins from 'on'.
        for (let p in options) {
            if (options.hasOwnProperty(p) && typeof options[p] === 'function' && p.length > 2 && p.slice(0, 2) === 'on') {
                this.on(p.slice(2).toLowerCase(), options[p]);
            }else if (!this.hasOwnProperty(p)) {
                this[p] = options[p];
            }
        }
    }

    applyTo(target, params) {
        let ext = new ExtensionInstance(target, this);

        for (let p in params) {
            if (params.hasOwnProperty(p) && ext.params.hasOwnProperty(p)) {
                ext.params[p] = params[p];
            }
        }

        if (target.hasOwnProperty('__') && target.__.hasOwnProperty('extensions')) {
            target.__.extensions[this.name] = ext;
        }

        this.triggerEvent('apply', ext, target, ext.params);
        extensionsManager.triggerEvent('apply', ext);
        return ext;
    }

    removeFrom(target) {
        if (target.hasOwnProperty('__') && target.__.hasOwnProperty('extensions')) {
            let ext = target.__.extensions[this.name];
            if (ext instanceof ExtensionInstance) {
                ext.triggerEvent('remove');
                this.triggerEvent('remove', ext);
            }
        }
    }
}
// Add events support.
addEventsMethods(Extension.prototype);

/**
 * Class that represents instance of the applied extension.
 * Holds information about extension, target and parameters.
 *
 * @property name   {string}
 * @property target {Element|Instance}
 * @property params {object}
 *
 * @method on(eventName, handler)
 * @method off(eventName, handler)
 * @method triggerEvent(eventName, [args...])
 */
class ExtensionInstance
{
    constructor(target, extension) {
        this.name = extension.name;
        this.target = target;
        this.params = cloneSimpleObject(extension.params);
        this.vars = {};
    }

    update(params) {
        let ext = extensionsManager(this.name);
        if (ext !== null) {
            ext.triggerEvent('update', this, params);
        }
    }

    remove() {
        let ext = extensionsManager(this.name);
        if (ext !== null) {
            ext.triggerEvent('remove', this);
        }
    }
}
addEventsMethods(ExtensionInstance.prototype);

/**
 * Object that holds all registered extensions.
 * @type {{Extension}}
 */
let extensions = {};


/**
 * Exported function-helper that returns extension by name.
 * Also has methods to manage extensions.
 * @param name
 * @return {*}
 */
export default function extensionsManager(name) {
    if (extensions.hasOwnProperty(name)) {
        return extensions[name];
    }
    return null;
}
addEventsMethods(extensionsManager);

/**
 * Registers new extension with given name.
 * @param name {string}
 * @param options {object}
 */
extensionsManager.register = function(name, options) {
    if (extensions.hasOwnProperty(name)) {
        error('Extension with name "' + name + '" is already registered.');
    }
    let ext = new Extension(name, options);
    extensionsManager.triggerEvent('register', ext);
    extensions[name] = ext;
};
import uiRegistry from '../registries/ui-registry';
import Element from './element';
import Data from './data';
import addEventsMethods from '../utils/events-methods';
import extensionsManager from './extension';
import {error, warn} from '../utils/logging';

/**
 * Class that represents single UI instance.
 * Its necessary to define class as function to allow use 'call()' method.
 */
export default function Instance(){
    // Define service property that encapsulates hidden data.
    Object.defineProperty(this, '__', {
        value: {},
        configurable: false,
        enumerable: false,
        writeable: false
    });

    this.__.extensions = {};
    this.__.events = {};
    this.__.dispatchers = {};
    this.__.eventsTimeouts = {};
    this.__.ui = null;
    this.__.parent = null;
    this.__.data = null;
    this.__.params = {};
}

// Add events supporting for Instance.
addEventsMethods(Instance.prototype);


/**
 * Checks if UI implements interface with given name.
 * @param interfaceName {string}
 * @return {boolean}
 */
Instance.prototype.isImplementationOf = function(interfaceName) {
    return this.__.ui.__.implements.indexOf(interfaceName) >= 0;
};

/**
 * Removes Instance from the parent Element.
 */
Instance.prototype.remove = function () {
    // remove this instance from the parent children[] property
    let parent = this.__.parent;
    let scheme = this.__.ui.scheme;


    for (let p in scheme) {
        if (scheme.hasOwnProperty(p) && this[p].__.node.parentNode !== null){
            this[p].__.node.parentNode.removeChild(this[p].__.node);
        }
    }

    if (parent instanceof Element !== true) return;

    for (let i = 0, len = parent.__.children.length; i < len; i++) {
        if (parent.__.children[i] === this) {
            parent.__.children.splice(i, 1);
            break;
        }
    }
};


/**
 * Returns UI of the instance.
 * @returns {UI|*}
 */
Instance.prototype.ui = function () {
    return this.__.ui;
};

/**
 * Deprecated method.
 * Please use [ui()] method instead.
 * Returns UI of the instance.
 * @returns {UI|*}
 * @deprecated
 * @see Instance.ui
 */
Instance.prototype.UI = function () {
    return this.__.ui;
};

/**
 * Returns UI of the instance.
 * @returns {UI|*}
 */
Instance.prototype.loadLocalization = function (callback) {
    let L = this.__.ui.localization;
    if(L !== null){
        L10n.loadTranslations(L, callback);
    }else{
        warn('Localization loading failed: localization category is not specified for the UI "' + this.__.ui.name + '".');
    }
};


/**
 * Returns parameters of the instance.
 * @returns {UI|*}
 * @constructor
 */
Instance.prototype.params = function () {
    return this.__.params;
};


/**
 * Returns parent Instance.
 * @returns Instance|null
 */
Instance.prototype.parentUII = function () {
    let parent = this.__.parent;
    if (parent instanceof Element) return parent.__.uiinstance;
    return null;
};


/**
 * Loads data to the instance.
 * @param {object} data        Data to be loaded.
 * @param {boolean} [replace]        If true all existing data will be removed before loading.
 * @param {boolean} [atStart]        If true new data will be inserted into the start.
 */
Instance.prototype.load = function (data, replace, atStart) {
    if (typeof replace !== 'boolean') replace = true;
    if (typeof atStart !== 'boolean') atStart = false;

    if (data instanceof Data) {
        try {
            data.fetch(function (replace, atStart, response) {
                this.load(response, replace, atStart);
                this.triggerEvent('afterLoad', data);
                this.__.ui.triggerEvent('afterLoad', this, data);
            }.bind(this, replace, atStart));
        } catch (e) {
            error(e);
        }
        return this;
    }


    // Trigger event on the UI.
    let event = new Event('load', {cancelable: true});
    this.__.ui.triggerEvent('load', this, data, event);
    if (event.defaultPrevented){
        this.triggerEvent('afterLoad', data);
        this.__.ui.triggerEvent('afterLoad', this, data);
        return this;
    }

    // Trigger event on the instance.
    event = new Event('load', {cancelable: true});
    this.triggerEvent('load', data, event);
    if (event.defaultPrevented){
        this.triggerEvent('afterLoad', data);
        this.__.ui.triggerEvent('afterLoad', this, data);
        return this;
    }


    if (typeof data !== 'object') {
        //warn('Instance data loading error: invalid argument. Object is required but ' + typeof data + ' given.');
    }

    let root = this.getRootElement();
    if (typeof data === 'string') {

        if (root !== null) {
            root.load(data, replace, atStart);
            this.triggerEvent('afterLoad', data);
            this.__.ui.triggerEvent('afterLoad', this, data);
            return this;
        }
    }


    if (Array.isArray(data)) {
        if (root !== null) {
            root.load(data, replace, atStart);
            this.triggerEvent('afterLoad', data);
            this.__.ui.triggerEvent('afterLoad', this, data);
            return this;
        }
    }


    for (let p in data) {
        if (p === '__') continue; // Prevent from changing some initial properties.

        if (this.hasOwnProperty(p)) {
            let el = this[p];

            if (this[p] instanceof Element) {

                let inclusion = el.inclusion(); // Included Instance
                if (inclusion instanceof Instance) {

                    if (Array.isArray(data[p])) {
                        let incRoot = inclusion.getRootElement();
                        if (incRoot === null || !el.hasChildUI()) {
                            inclusion.load(data[p], replace, atStart);
                        } else {
                            try {
                                incRoot.load(data[p], replace, atStart);
                            } catch (e) {
                                error(e);
                            }
                        }
                    } else {
                        inclusion.load(data[p], replace, atStart);
                    }


                } else {
                    try {
                        this[p].load(data[p], replace, atStart);
                    } catch (e) {
                        error(e);
                    }
                }

            } else {
                el.load(data[p], replace, atStart);
            }

        }else{
            let ui = uiRegistry.get(p);
            if (ui !== null && root !== null) {
                ui.renderTo(root, false, {}).load(data[p], true, false);
            }
        }
    }
    this.triggerEvent('afterLoad', data);
    this.__.ui.triggerEvent('afterLoad', this, data);
    return this;
};


/**
 * Returns top level Element that contains all another element.
 * If top level has few elements - null will be returned.
 * @returns {Element}
 */
Instance.prototype.getRootElement = function () {
    let topLevel = Object.keys(this.__.ui.scheme);
    return topLevel.length === 1 && this.hasOwnProperty(topLevel[0]) ? this[topLevel[0]] : null;
};

/**
 * Returns top level Element that contains all another element.
 * If top level has few elements - null will be returned.
 * @returns {Element}
 */
Instance.prototype.getLastRootElement = function () {
    let topLevel = Object.keys(this.__.ui.scheme);
    let lastKey = topLevel[topLevel.length - 1];
    return topLevel.length === 1 && this.hasOwnProperty(lastKey) ? this[lastKey] : null;
};



Instance.prototype.appendTo = function (element) {
    // Check argument.
    let node = element instanceof Element ? element.node() : element;
    if(node.appendChild === undefined){
        error('Invalid argument given for the instance "appendAfter()" method: ' + (typeof element) + ' given but node or element is required.');
        return;
    }

    let scheme = this.UI().scheme;

    for(let p in scheme){
        if(scheme.hasOwnProperty(p) && this.hasOwnProperty(p)){
            node.appendChild(this[p].node());
            if(node.element instanceof Element){
                this[p].__.parent = node.element;
            }
        }
    }
};



Instance.prototype.appendAfter = function (element) {
    // Check argument.
    let node = element instanceof Element ? element.node() : element;
    if(node.appendChild === undefined){
        error('Invalid argument given for the instance "appendAfter()" method: ' + (typeof element) + ' given but node or element is required.');
        return;
    }

    // Check if node have parent.
    let parent = node.parentNode;
    if(parent === null){
        error('Element given for the method instance "appendAfter()" have no parent node.');
        return;
    }

    let scheme = this.UI().scheme;
    let next = node.nextSibling;
    if (next) {
        for(let p in scheme){
            if(scheme.hasOwnProperty(p) && this.hasOwnProperty(p)){
                parent.insertBefore(this[p].node(), next);
                if(parent.element instanceof Element){
                    this[p].__.parent = parent.element;
                }
            }
        }
    } else {
        for(let p in scheme){
            if(scheme.hasOwnProperty(p) && this.hasOwnProperty(p)){
                parent.appendChild(this[p].node());
                if(parent.element instanceof Element){
                    this[p].__.parent = parent.element;
                }
            }
        }
    }
};

Instance.prototype.appendBefore = function (element) {
    // Check argument.
    let node = element instanceof Element ? element.node() : element;
    if(node.appendChild === undefined){
        error('Invalid argument given for the instance "appendAfter()" instance method: ' + (typeof element) + ' given but node or element is required.');
        return;
    }

    // Check if node have parent.
    let parent = node.parentNode;
    if(parent === null){
        error('Element given for the method instance "appendAfter()" have no parent node.');
        return;
    }

    let scheme = this.UI().scheme;
    for(let p in scheme){
        if(scheme.hasOwnProperty(p) && this.hasOwnProperty(p)){
            parent.insertBefore(this[p].node(), node);
            if(parent.element instanceof Element){
                this[p].__.parent = parent.element;
            }
        }
    }
};





/**
 * Applies extension to the instance.
 * Returns true if applying was successful.
 * @returns {boolean}
 */
Instance.prototype.applyExtension = function (name, params) {
    // Log warning if extension is already applied to the element.
    if(this.__.extensions.hasOwnProperty(name)){
        warn('Extension with name "' + name + '" is already applied to the instance.');
        return false;
    }

    // Log error if requested extension is absent.
    let ext = extensionsManager(name);
    if(ext === null){
        error('Extension with name "' + name + '" is not registered yet.');
        return false;
    }

    this.__.extensions[name] = ext.applyTo(this, params);
    return true;
};


/**
 * Returns extension by name.
 * @param name {string}
 * @return {ExtensionInstance|null}
 */
Instance.prototype.extension = function (name) {
    if(this.__.extensions.hasOwnProperty(name)){
        return this.__.extensions[name];
    }
    return null;
};

/**
 * Removes extension from the instance.
 * Returns true if removing was successful.
 * @param name {string}
 * @returns {boolean}
 */
Instance.prototype.removeExtension = function (name) {
    // Return false if extension with given name was not applied yet.
    if(!this.__.extensions.hasOwnProperty(name)){
        return false;
    }

    let ext = this.__.extensions[name];
    if (ext.remove !== undefined) {
        ext.remove();
        delete this.__.extensions[name];
        return true;
    }

    return false;
};

/**
 * Tries to update extension with given name by passing new parameters.
 * To make update possible extension must implement 'update' event handler.
 * @param name {string} Name of the extension.
 * @param params {object} Parameters to be updated.
 * @return {boolean}
 */
Instance.prototype.updateExtension = function (name, params) {
    // Return false if extension with given name was not applied yet.
    if(!this.__.extensions.hasOwnProperty(name)){
        return false;
    }
    let ext = this.__.extensions[name];
    if (ext.update !== undefined) {
        ext.update(params);
        return true;
    }
    return false;
};
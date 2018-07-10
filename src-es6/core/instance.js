import uiRegistry from '../registries/ui-registry';
import UIElement from './element';
import eventsImplementation from '../helpers/events-implementation';

export default class UIInstance
{
    constructor(){
        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        this.__.events = {};
        this.__.ui = null;
        this.__.parent = null;
        this.__.data = null;
        this.__.params = {};
    }
}

// Add events supporting for UIInstance.
eventsImplementation.call(UIInstance.prototype);


/**
 * Removes UIInstance from the parent UIElement.
 */
UIInstance.prototype.remove = function () {
    // remove this instance from the parent children[] property
    let parent = this.__.parent;
    let scheme = this.__.ui.scheme;


    for (let p in scheme) {
        if (scheme.hasOwnProperty(p) && this[p].__.node.parentNode !== null){
            this[p].__.node.parentNode.removeChild(this[p].__.node);
        }
    }

    if (parent instanceof UIElement !== true) return;

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
 * @constructor
 */
UIInstance.prototype.UI = function () {
    return this.__.ui;
};

/**
 * Returns UI of the instance.
 * @returns {UI|*}
 * @constructor
 */
UIInstance.prototype.loadLocalization = function (callback) {
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
UIInstance.prototype.params = function () {
    return this.__.params;
};


/**
 * Returns parent UIInstance.
 * @return UIInstance|null
 */
UIInstance.prototype.parentUII = function () {
    let parent = this.__.parent;
    if (parent instanceof UIElement) return parent.__.uiinstance;
    return null;
};


/**
 * Loads data to the instance.
 * @param {object} data        Data to be loaded.
 * @param {boolean} [replace]        If true all existing data will be removed before loading.
 * @param {boolean} [atStart]        If true new data will be inserted into the start.
 */
UIInstance.prototype.load = function (data, replace, atStart) {
    if (typeof replace !== 'boolean') replace = true;
    if (typeof atStart !== 'boolean') atStart = false;

    if (data instanceof UIData) {
        try {
            data.fetch(function (replace, atStart, response) {
                this.load(response, replace, atStart);
                this.triggerEvent('afterLoad', data);
                this.__.ui.triggerEvent('afterLoad', this, data);
            }.bind(this, replace, atStart));
            return this;
        } catch (e) {
            error(e);
        }
    }


    // Trigger event on the UI.
    let event = new UIEvent('load');
    event.target = this.__.ui;
    this.__.ui.triggerEvent('load', this, data, event);
    if (event.canceled){
        this.triggerEvent('afterLoad', data);
        this.__.ui.triggerEvent('afterLoad', this, data);
        return this;
    }

    // Trigger event on the instance.
    event = new UIEvent('load');
    event.target = this;
    this.triggerEvent('load', data, event);
    if (event.canceled){
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

            if (this[p] instanceof UIElement) {

                let inclusion = el.inclusion(); // Included UIInstance
                if (inclusion instanceof UIInstance) {

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
 * Returns top level UIElement that contains all another element.
 * If top level has few elements - null will be returned.
 * @returns {UIElement}
 */
UIInstance.prototype.getRootElement = function () {
    let topLevel = Object.keys(this.__.ui.scheme);
    return topLevel.length === 1 && this.hasOwnProperty(topLevel[0]) ? this[topLevel[0]] : null;
};
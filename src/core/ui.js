import {cloneSchemeLinear, buildScheme, filterUIParameterValue} from '../utils/ui-utils';
import {cloneSimpleObject} from '../utils/object-utils';
import {InvalidSchemeException} from '../utils/exceptions';
import addEventsMethods from '../utils/events-methods';
import {error} from '../utils/logging';
import Element from './element';
import Instance from './instance';
import cssGenerator from './css-generator';
import Extending from './extending';
import interfaceManager from './interface';
import uiRegistry from '../registries/ui-registry';
import extendingsRegistry from '../registries/extendings-registry';

/**
 * @class
 * @method addEventListener(eventName, handler)
 * @method on(eventName, handler)
 * @method triggerEvent(eventName, options)
 */
export default class UI
{
    constructor (options) {
        if (typeof options !== 'object') options = {};

        this.namespace    = '';
        this.elements     = {};
        this.scheme       = options.hasOwnProperty('scheme') ? options.scheme : {};
        this.rules        = options.hasOwnProperty('rules') ? options.rules : {};
        this.prefix       = options.hasOwnProperty('prefix') ? options.prefix : '';
        this.name         = options.hasOwnProperty('name') ? options.name : '';
        this.css          = options.hasOwnProperty('css') ? options.css : null;

        // Object that holds information about dependencies.
        this.dependencies = {};

        this.localization = options.hasOwnProperty('localization') ? options.localization : null;
        this.translations = options.hasOwnProperty('translations') ? options.translations : {};

        this.css          = options.css || options.styles || {};
        this.cssLoaded    = false;

        if (typeof this.scheme !== 'object'){
            throw new InvalidSchemeException('Scheme must be an object. ' + typeof this.scheme + ' given.');
        }

        // Define service property that encapsulates hidden data.
        this.__ = {};

        // Add some properties for the events supporting.
        this.__.dispatchers = {};
        this.__.events    = {};
        this.__.eventsTimeouts = {};

        this.__.implements = [];

        this.__.styleNode = null;
        this.__.data      = options.hasOwnProperty('data') ? options.data : null;
        this.__.url       = null;
        this.__.params    = options.params || options.parameters || {};

        if (options.hasOwnProperty('methods')) {

            // Detect which interfaces this scheme implements.
            this.__.implements = interfaceManager.detectInterfacesFor(options.methods);

            // Add UI to the interfaces implementations.
            for (let i = 0; i < this.__.implements.length; i++) {
                interfaceManager.addImplementation(this.__.implements[i], this);
            }

            // Define instance constructor to implement methods.
            this.uiiConstructor = (function(){
                function AnotherInstance(options){
                    Instance.call(this, options);
                }
                AnotherInstance.prototype = Object.create(Instance.prototype);
                AnotherInstance.prototype.constructor = Instance;
                for(let p in options.methods){
                    if(options.methods.hasOwnProperty(p)){
                        if(typeof options.methods[p] === 'function' && !Instance.prototype.hasOwnProperty(p)){
                            AnotherInstance.prototype[p] = options.methods[p];
                        }
                    }
                }
                return AnotherInstance;
            })();
        }else{
            this.uiiConstructor = Instance;
        }


        // Clone all elements from scheme to 'elements' object.
        cloneSchemeLinear(this.scheme, this.elements);

        if (options.hasOwnProperty('dependencies')) {
            let deps = options.dependencies;
            for (let p in deps) {
                // Skip dependency if element with given key is absent in the scheme.
                if (!this.elements.hasOwnProperty(p)) {
                    continue;
                }

                if (Array.isArray(deps[p])) {
                    this.dependencies[p] = deps[p];
                }else if(typeof deps[p] === 'string') {
                    let d = deps[p].split(',');
                    for (let i = 0, len = d.length; i < len; i++) {
                        d[i] = d[i].trim();
                    }
                    this.dependencies[p] = d;
                }
            }
        }

        for(let p in this.elements){
            if(this.elements.hasOwnProperty(p) && this.rules.hasOwnProperty(p) && this.elements[p].rules === '') {
                this.elements[p].rules = this.rules[p];
            }
        }

        for (let p in options) {
            if (options.hasOwnProperty(p) && p.slice(0, 2) === 'on' && typeof options[p] === 'function') {
                this.addEventListener(p.slice(2), options[p]);
            }
        }
    }

    /**
     * Removes all instances of this UI from the given container.
     * @param container
     * @return {UI}
     */
    removeFrom(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container instanceof Element) {
            container = container.node();
        }

        let items = container.childNodes;

        for (let i = 0; i < items.length; i++) {
            if (items[i].instance instanceof Instance && items[i].instance.UI() === this) {
                let event = new Event('remove', {cancelable: true});
                items[i].instance.triggerEvent('remove', event);
                if (!event.defaultPrevented) {
                    items[i].instance.remove();
                }
            }
        }
    }

    /**
     * Checks if UI implements interface with given name.
     * @param interfaceName {string}
     * @return {boolean}
     */
    isImplementationOf(interfaceName) {
        return this.__.implements.indexOf(interfaceName) >= 0;
    }

    /**
     * Returns root element of the UI scheme.
     * @returns {Element}
     */
    getRootElement() {
        let topLevel = Object.keys(this.scheme);
        return topLevel.length === 1 ? this.elements[topLevel[0]] : null;
    }

    prepare(params) {

        params = cloneSimpleObject(params);

        // Create new UI instance.
        let instance = new this.uiiConstructor();
        instance.__.ui = this; // Set UI property.

        // Lets allow users to modify options using "prepare" event.
        let options = {
            container : null,
            atStart : false,
            params : params,
            localization : this.localization,
            translations : Object.assign({}, this.translations)
        };

        this.triggerEvent('prepare', instance, options);

        params = options.params;

        // Set localization configuration for the whole instance.
        // __.localization property is defines localization category.
        // The category is a string that used to load localization data by packs.
        // The loading logic MUST be implemented by the developer (see L10n module).
        instance.__.localization = options.localization;
        instance.__.translations = options.translations;

        // Build scheme recursively but not define target.
        try {
            buildScheme(instance, this, this.scheme, null);
        } catch (e) {
            error(e);
        }

        // Filter given parameters.
        if (typeof params !== 'object') params = {};
        for(let p in params){
            if(params.hasOwnProperty(p)){
                params[p] = filterUIParameterValue(params[p]);
            }
        }

        // Append default parameters that absent in the given by user.
        for (let p in this.__.params) {
            if (this.__.params.hasOwnProperty(p) && !params.hasOwnProperty(p)) {
                params[p] = this.__.params[p];
            }
        }

        instance.__.params = params;

        // Trigger 'render' event.
        let event = new Event('create', {cancelable: true});
        this.triggerEvent('create', instance, params, event);

        return instance;
    };


    /**
     * Renders UI into the container.
     *
     * Example: UIBuilder('searchBar').renderTo('body');
     *
     * @param {node|string|Element} container - element in which Instance will be built
     * @param {boolean} [atStart] - if true, builds UI into start of the list (default - false)
     * @param {object} [params]
     *
     * @event beforeRender
     * @event render
     *
     * @returns {Instance}
     **/
    renderTo (container, atStart, params) {

        // Set parameters if atStart flag is missing.
        // It allows to pass atStart argument.
        // Examples:
        //     UI('Spinner').renderTo('#container', {size: 2})
        //     UI('Spinner').render({size: 2}) // Renders into the document.body. See [render()] method.
        if (typeof atStart === 'object' && typeof params !== 'object') params = atStart;

        // Create new UI instance that will be returned by this function.
        let instance = this.prepare(params);

        params = instance.__.params;

        // Lets allow users to modify rendering options during 'beforeRender' event.
        let options = {
            container : container,
            atStart : atStart,
            params : instance.__.params,
            localization : this.localization,
            translations : Object.assign({}, this.translations)
        };
        this.triggerEvent('beforeRender', options);

        // Apply changing.
        container = options.container;
        atStart = options.atStart;



        // Set localization configuration for the whole instance.
        // __.localization property is defines localization category.
        // The category is a string that used to load localization data by packs.
        // The loading logic MUST be implemented by the developer (see L10n module).
        instance.__.localization = options.localization;
        instance.__.translations = options.translations;


        // If we render UI into the Element of another Instance - make necessary links.
        let containerNode = container;
        if (container instanceof Element) {
            instance.__.parent = container;       // Set parent element for newly created instance.
            container.__.children.push(instance); // Add instance to the children list of the container.
            containerNode = container.node();
        }else if (typeof container === 'string') {
            containerNode = document.querySelector(container);
        }

        // Generate styles if CSS property specified and styles are not loaded yet.
        if (!this.cssLoaded && this.css !== null) {
            this.createStyles();
        }

        // Set flag if instance should be built at the start or at the end.
        atStart = atStart === true;

        // Append root instance nodes to the container.
        let scheme = this.scheme;
        for (let p in scheme) {
            if (scheme.hasOwnProperty(p)) {
                if (!atStart || containerNode.childNodes.length === 0) {
                    containerNode.appendChild(instance[p].node());
                }else {
                    containerNode.insertBefore(instance[p].node(), containerNode.childNodes[0]);
                }

                if (container instanceof Element) {
                    instance[p].__.parent = container;
                }
            }
        }

        // Filter given parameters.
        if (typeof params !== 'object') params = {};
        for(let p in params){
            if(params.hasOwnProperty(p)){
                params[p] = filterUIParameterValue(params[p]);
            }
        }

        // Append default parameters that absent in the given by user.
        for (let p in this.__.params) {
            if ( ! params.hasOwnProperty(p) && this.__.params.hasOwnProperty(p)){
                params[p] = this.__.params[p];
            }
        }

        // Trigger 'render' event.
        this.triggerEvent('render', instance, params);

        // Return instance of the UI.
        return instance;
    }


    /**
     * Renders UI to the <body>.
     * @param params
     */
    render (params) {
        return this.renderTo('body', params);
    }


    /**
     * Generates CSS for the UI using [generageCSS()] method
     * and appends it as new <style> tag.
     */
    createStyles () {
        this.cssLoaded = true;
        let css = cssGenerator.generateUIStyles(this);
        if (css === '') return;
        let head = document.getElementsByTagName('head')[0];
        let styleTag = document.createElement('style');
        styleTag.setAttribute('data-ui', this.name);
        styleTag.ui = this;
        styleTag.innerHTML = css;
        head.appendChild(styleTag);
    }
}


/**
 * Adds event handler for the UI.
 *
 * There are few events available:
 * - beforeRender
 * - render
 * - destroy
 * - change
 */
addEventsMethods(UI.prototype);



/**
 * Extends another UI.
 * We must define this method directly in the prototype because it reserved.
 * @param name
 * @param options
 */
UI.prototype.extends = function (name, options) {
    let extending = new Extending(this, name, options);
    uiRegistry.remove(this.name);
    extendingsRegistry.add(this.name, extending);
};

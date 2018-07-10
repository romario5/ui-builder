import {cloneSchemeLinear, buildScheme, filterUIParameterValue} from '../helpers/ui-utils';
import {InvalidSchemeException} from '../exceptions';
import eventsImplementation from '../helpers/events-implementation';
import {error} from '../logging';
import UIElement from './element';
import UIInstance from './instance';
import cssGenerator from '../etc/css-generator';
import UIExtending from './extending';


/**
 * @method addEventListener(eventName, handler)
 * @method on(eventName, handler)
 * @method triggerEvent(eventName, options)
 */
export default class UI {
    constructor (options) {
        if (typeof options !== 'object') options = {};

        this.elements     = {};
        this.scheme       = options.hasOwnProperty('scheme') ? options.scheme : {};
        this.rules        = options.hasOwnProperty('rules') ? options.rules : {};
        this.prefix       = options.hasOwnProperty('prefix') ? options.prefix : '';
        this.name         = options.hasOwnProperty('name') ? options.name : '';
        this.css          = options.hasOwnProperty('css') ? options.css : null;
        this.localization = options.hasOwnProperty('localization') ? options.localization : null;
        this.translations = options.hasOwnProperty('translations') ? options.translations : {};
        this.css          = options.css || options.styles || {};
        this.cssLoaded    = false;

        if (typeof this.scheme !== 'object'){
            throw new InvalidSchemeException('Scheme must be an object. ' + typeof this.scheme + ' given.');
        }

        // Define instance constructor to implement methods.
        this.uiiConstructor = !options.hasOwnProperty('methods') ? UIInstance : (function(){
            function AnotherUIInstance(options){
                UIInstance.call(this, options);
            }
            AnotherUIInstance.prototype = Object.create(UIInstance.prototype);
            AnotherUIInstance.prototype.constructor = UIInstance;
            for(let p in options.methods){
                if(options.methods.hasOwnProperty(p)){
                    if(typeof options.methods[p] === 'function' && !UIInstance.prototype.hasOwnProperty(p)){
                        AnotherUIInstance.prototype[p] = options.methods[p];
                    }
                }
            }
            return AnotherUIInstance;
        })();


        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        this.__.events    = {};
        this.__.styleNode = null;
        this.__.data      = options.hasOwnProperty('data') ? options.data : null;
        this.__.url       = null;
        this.__.params    = options.params || options.parameters || {};


        // Clone all elements from scheme to 'elements' object.
        cloneSchemeLinear(this.scheme, this.elements);


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
     * Returns root element of the UI scheme.
     * @return {UIElement}
     */
    getRootElement() {
        let topLevel = Object.keys(this.scheme);
        return topLevel.length === 1 ? this.elements[topLevel[0]] : null;
    }


    /**
     * Renders UI into the container.
     *
     * Example: UIBuilder('searchBar').renderTo('body');
     *
     * @param {node|string|UIElement} container - element in which UIInstance will be built
     * @param {boolean} [atStart] - if true, builds UI into start of the list (default - false)
     * @param {object} [params]
     *
     * @event beforeRender
     * @event render
     *
     * @return {UIInstance}
     **/
    renderTo (container, atStart, params) {
        // Lets allow users to modify rendering options during 'beforeRender' event.
        let options = {
            container : container,
            atStart : atStart,
            params : params,
            localization : this.localization,
            translations : Object.assign({}, this.translations)
        };
        this.triggerEvent('beforeRender', options);

        // Apply changing.
        container = options.container;
        atStart = options.atStart;
        params = options.params;

        // Create new UI instance that will be returned by this function.
        let instance = new this.uiiConstructor();

        instance.__.ui = this; // Set UI property.

        // Set localization configuration for the whole instance.
        // __.localization property is defines localization category.
        // The category is a string that used to load localization data by packs.
        // The loading logic MUST be implemented by the developer (see L10n module).
        instance.__.localization = options.localization;
        instance.__.translations = options.translations;

        // Set parameters if atStart flag is missing.
        // It allows to pass atStart argument.
        // Examples:
        //     UI('Spinner').renderTo('#container', {size: 2})
        //     UI('Spinner').render({size: 2}) // Renders into the document.body. See [render()] method.
        if (typeof atStart === 'object' && typeof params !== 'object') params = atStart;

        // Set flag if instance should be built at the start or at the end.
        if (atStart !== true) atStart = false;


        // If we render UI into the UIElement of another UIInstance - make necessary links.
        if (container instanceof UIElement) {
            instance.__.parent = container;       // Set parent element for newly created instance.
            container.__.children.push(instance); // Add instance to the children list of the container.
        }

        // Build scheme recursively.
        try {
            buildScheme(instance, this, this.scheme, container, atStart);
        } catch (e) {
            error(e);
        }


        // Generate styles if CSS property specified and styles are not loaded yet.
        if (!this.cssLoaded && this.css !== null) {
            this.createStyles();
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

        instance.__.params = params;


        // Trigger 'render' event.
        let event = new UIEvent('render');
        event.target = this;
        this.triggerEvent('render', instance, params, event);

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
        let head = document.getElementsByTagName('head')[0];
        let styleTag = document.createElement('style');
        styleTag.setAttribute('data-ui', this.name);
        styleTag.ui = this;
        styleTag.innerHTML = cssGenerator.generateUIStyles(this);
        head.appendChild(styleTag);
        this.cssLoaded = true;
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
eventsImplementation.call(UI.prototype);



/**
 * Extends another UI.
 * We must define this method directly in the prototype because it reserved.
 * @param name
 * @param options
 */
UI.prototype.extends = function (name, options) {
    let extending = new UIExtending(this, name, options);
    delete uiList[this.name];
    uiExtendings[this.name] = extending;
};

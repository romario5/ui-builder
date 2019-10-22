import uiRegistry from '../registries/ui-registry';
import Instance from './instance';
import interfaceManager from './interface';
import {extendObject, cloneSimpleObject} from '../utils/object-utils';
import {cloneSchemeLinear} from '../utils/ui-utils';


/**
 * Class that represents UI extending.
 * It must be implemented as class because all UIs can be registered in any sequence.
 * So we will provide functionality to resolve extending when extending UI is needed by developer.
 */
export default class UIExtending
{
    /**
     * Stores all necessary data that will be used later when extending will be resolved.
     * @param extendingUI
     * @param extendedUIName
     * @param options
     */
    constructor (extendingUI, extendedUIName, options) {
        this.extendingUI = extendingUI;
        this.extendedUIName = extendedUIName;
        this.options = options;
    }


    /**
     * Completes UI extending and UI that makes extending.
     * @returns {UI}
     */
    extend () {
        let extendedUI = uiRegistry.get(this.extendedUIName);
        if(extendedUI === null){
            throw new UIRegistrationException('UI which be extended is not found.');
        }

        let extendingUI = this.extendingUI;
        let options = this.options;

        if(!options.hasOwnProperty('scheme')) options.scheme = {};
        if(!options.hasOwnProperty('rules')) options.rules = {};
        if(!options.hasOwnProperty('styles')) options.styles = {};
        if(!options.hasOwnProperty('translations')) options.translations = {};
        if(!options.hasOwnProperty('params')) options.params = {};

        extendingUI.uiiConstructor = extendedUI.uiiConstructor;
        extendingUI.elements       = {};
        extendingUI.scheme         = extendObject(options.scheme, cloneSimpleObject(extendedUI.scheme));
        extendingUI.rules          = extendObject(options.rules, cloneSimpleObject(extendedUI.rules));
        extendingUI.translations   = extendObject(options.translations, cloneSimpleObject(extendedUI.translations));
        extendingUI.css            = extendObject(options.styles, cloneSimpleObject(extendedUI.css));
        extendingUI.params         = extendObject(options.params, cloneSimpleObject(extendedUI.params));
        extendingUI.localization   = options.hasOwnProperty('localization') ? options.localization : extendedUI.localization;
        extendingUI.cssLoaded      = false;

        extendingUI.__.events      = cloneSimpleObject(extendedUI.__.events);
        extendingUI.__.styleNode   = null;
        extendingUI.__.data        = options.hasOwnProperty('data') ? options.data : null;
        extendingUI.__.url         = null;

        // Define instance constructor to implement methods.
        extendingUI.uiiConstructor = !options.hasOwnProperty('methods') ? extendedUI.uiiConstructor : (function(){
            function AnotherInstance(options){
                Instance.call(this, options);
            }
            AnotherInstance.prototype = Object.create(extendedUI.uiiConstructor.prototype);
            AnotherInstance.prototype.constructor = Instance;
            for(let p in options.methods){
                if(options.methods.hasOwnProperty(p) && typeof options.methods[p] === 'function' && !Instance.prototype.hasOwnProperty(p)){
                    AnotherInstance.prototype[p] = options.methods[p];
                }
            }

            extendingUI.__.implements = interfaceManager.detectInterfacesFor(options.methods);
            return AnotherInstance;
        })();

        // Parameters to be used on rendering.
        if(options.hasOwnProperty('parameters')){
            extendingUI.__.params = extendObject(options.parameters, cloneSimpleObject(extendedUI.__.params));
        }else if(options.hasOwnProperty('params')){
            extendingUI.__.params = extendObject(options.params, cloneSimpleObject(extendedUI.__.params));
        }

        // Clone all elements from scheme to 'elements' property.
        cloneSchemeLinear(extendingUI.scheme, extendingUI.elements);

        // Override rules property for the elements if they are defined separately from the scheme.
        for(let p in extendingUI.elements){
            if(extendingUI.elements.hasOwnProperty(p) && extendingUI.rules.hasOwnProperty(p) && extendingUI.elements[p].rules === ''){
                extendingUI.elements[p].rules = extendingUI.rules[p];
            }
        }

        // Add necessary event listeners.
        for (let p in options) {
            if (options.hasOwnProperty(p) && p.slice(0, 2) === 'on' && typeof options[p] === 'function') {
                extendingUI.addEventListener(p.slice(2), options[p]);
            }
        }

        return extendingUI;
    }
}


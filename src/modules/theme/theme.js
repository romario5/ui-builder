import StyleGetter from './style-getter';
import addEventsMethods from '../../utils/events-methods';
import Color from '../../utils/color';
import {warn, log} from '../../utils/logging';
import Settings from '../../core/settings';
import {extendObject} from '../../utils/object-utils';
import cssGenerator from '../../core/css-generator';

/**
 * Themes
 *
 * Theme is a special object that encapsulates styles and
 * provides simple API to get/set properties, switching theme with
 * on-the-fly interface updating.
 */


/**
 * Object that contains all registered themes.
 * All registered themes will be stored as values where keys are themes names.
 * @type {{string: Theme}}
 */
let themes = {};
let currentTheme = null;


/**
 * Function that used in the UI definition
 * to retrieve style on CSS generating.
 * Returns StyleGetter for the given property name.
 *
 * Example of usage:
 *
 * style : {
 *     wrap : {
 *         backgroundColor: Theme('colors.primary')
 *     }
 * }
 *
 * In example above the backgroundProperty gets an instance
 * of the StyleGetter that indicates that when styles for
 * this UI will be generated the value must be fetched from the
 * theme dynamically.
 *
 * @param name
 * @returns {StyleGetter}
 */
export default function themesManager(name)
{
    return new StyleGetter(name);
}


/**
 * Add events support for the exported function.
 */
addEventsMethods(themesManager);


/**
 * Registers new theme.
 * Exported method.
 * Returns true if registration was successful or false if
 * theme with this name already exists.
 *
 * Example:
 *
 * Theme.register('Default', {
 *     colors : {
 *         primary : '#ff0000',
 *         secondary : '#366977'
 *     },
 *     // And so on...
 * });
 *
 * @param name {string}
 * @param {object} params
 * @param {boolean} [updateIfExists]
 * @return {boolean}
 */
themesManager.register = function(name, params, updateIfExists) {
    updateIfExists = updateIfExists !== false;
    if(!themes.hasOwnProperty(name)){
        themes[name] = new Theme(name, params);
        themesManager.triggerEvent('register', name);
        return true;
    }

    if (updateIfExists) {
        themes[name].updateStyles(params);
        if (Settings.logging) {
            log('Theme "' + name + '" has been updated.');
        }
        return true;
    }

    warn('Theme with name "' + name + '" is already registered.');
    return false;
};





/**
 * Switches to the theme with given name.
 * After theme switching all styles will be refreshed.
 * @param name {string}
 * @returns {boolean}
 */
themesManager.switchTo = function(name)
{
    if(!themes.hasOwnProperty(name)){
        warn('Theme can\'t be switched because theme "' + name + '" is not registered.');
        return false;
    }
    currentTheme = themes[name];

    // Update styles.
    let styles = document.getElementsByTagName('style');
    for(let i = 0, len = styles.length; i < len; i++){
        if(styles[i].hasOwnProperty('ui')){
            let ui = styles[i].ui;
            styles[i].innerHTML = cssGenerator.generateUIStyles(ui);
        }
    }

    this.triggerEvent('switch');

    return true;
};


/**
 * Returns a value for the given style.
 * The name can be set using dot-syntax for the nested items.
 * If requested property is absent - 'initial' will be returned.
 *
 * Example:
 * var color = Theme('buttons.danger.bgColor');
 *
 * @param {string} name
 * @return {string|number|null|Color}
 */
themesManager.getStyle = function(name)
{
    if(currentTheme === null){
        warn('Theme is not selected');
        return null;
    }

    // Get path and style name.
    let path = name.split('.');
    let style = path.pop();

    // If no path specified - return theme's style.
    if(path.length === 0){
        return currentTheme.getStyle(style);
    }

    // Look for style in the nested components (themes).
    let theme = currentTheme;

    do{
        let n = path.shift();
        if(!theme.components.hasOwnProperty(n)){
            if (Settings.devMode) {
                warn('Style with name "' + name + '" is absent in the current theme "' + currentTheme.name + '".');
            }
            return null;
        }
        theme = theme.components[n];
    }while(path.length > 0);

    return theme.getStyle(style);
};


/**
 * Returns name of the currently selected theme.
 * Can returns null if theme is not selected yet.
 * @return {string|null}
 */
themesManager.getThemeName = function(){
    if(currentTheme === null){
        warn('Theme is not selected');
        return null;
    }
    return currentTheme.name;
};


/**
 * Adds new theme section (nested theme).
 * Sections usage example: Theme('button.backgroundColor')
 */
themesManager.addSection = function(name, params)
{
    if(currentTheme === null){
        warn('Theme is not selected');
        return false;
    }

    if(currentTheme.components.hasOwnProperty(name)){
        warn('Component "' + name + '" already exists in the theme "' + currentTheme.name + '".');
        return false;
    }

    currentTheme.components[name] = new Theme(name, params);
    return true;
};



/**
 * Theme constructor.
 * Not available outside the library.
 * @param name
 * @param params
 * @constructor
 */
class Theme
{
    constructor(name, params){
        this.name = name;
        this.styles = {};
        this.components = {};

        if(typeof params === 'object'){
            for(let p in params){
                if(params.hasOwnProperty(p)){
                    if(typeof params[p] === 'object' && !(params[p] instanceof Color)){
                        this.components[p] = new Theme(p, params[p]);
                    }else{
                        this.styles[p] = params[p];
                    }
                }
            }
        }
    }

    getStyle(name) {
        if(!this.styles.hasOwnProperty(name)){
            warn('Style with name "' + name + '" is absent in the current theme "' + themesManager.getThemeName() + '".');
            return null;
        }
        return this.styles[name];
    }

    updateStyles(newStyles) {

        for(let p in newStyles){
            if(newStyles.hasOwnProperty(p)){
                if(typeof newStyles[p] === 'object' && !(newStyles[p] instanceof Color)){
                    if (this.components.hasOwnProperty(p)) {
                        this.components[p].updateStyles(newStyles[p]);
                    } else {
                        this.components[p] = new Theme(p, newStyles[p]);
                    }
                }else{
                    this.styles[p] = newStyles[p];
                }
            }
        }
    }
}



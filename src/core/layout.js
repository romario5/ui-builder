import addEventsMethods from '../utils/events-methods';
import UI from './ui'
import {error} from '../utils/logging';
import {checkUIParameters} from '../utils/ui-utils';
import uiRegistry from '../registries/ui-registry';

let layouts = {};

let currentLayoutName = null;
let currentLayoutInst = null;

/**
 * Returns layout by name.
 * @param name
 * @return {Instance|null}
 */
function getLayout(name) {
    if (layouts.hasOwnProperty(name)) {
        return layouts[name];
    }
    return null;
}

/**
 * Returns currently rendered layout.
 * @returns {LayoutUI}
 * @private
 */
export default function Layout(name) {
    if(layouts.hasOwnProperty(name)){
        return new LayoutUI(name);
    }
    error('Layout with name "' + name + '" is not registered yet.');
}
addEventsMethods(Layout);

/**
 * Registers new layout UI.
 * @param {object} data
 */
Layout.register = function (data) {
    checkUIParameters(data);
    if (uiRegistry.get(data.name) !== null){
        error('UI with name "' + data.name + '" already registered.');
    }
    layouts[data.name] = new UI(data);
    Layout.triggerEvent('register', layouts[data.name]);
    return layouts[data.name];
};

/**
 * Renders layout with given name.
 * @param name
 * @param params
 */
Layout.render = function (name, params) {
    let ui = getLayout(name);
    if(ui === null){
        error('Layout with name "' + name + '" is not registered yet.');
    }
    currentLayoutInst = ui.render(params);
    currentLayoutName = name;
    return currentLayoutInst;
};

/**
 * Returns instance of the current layout.
 * @returns {*}
 */
Layout.getInstance = function () {
    return currentLayoutInst;
};

/**
 * Object that provides all necessary methods.
 * Usage: Layout('Main').render();
 * @param name
 * @constructor
 */
class LayoutUI
{
    constructor(name) {
        this.name = name;
    }

    render(params ){
        let ui = getLayout(this.name);
        currentLayoutInst = ui.render(params);
        currentLayoutName = this.name;
        return currentLayoutInst;
    }
}

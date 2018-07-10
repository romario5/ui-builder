var layouts = {};

var currentLayoutName = null;
var currentLayoutInst = null;


function getLayout(name) {
    if (layouts.hasOwnProperty(name)) {
        return layouts[name];
    }
    return null;
}

/**
 * Returns currently rendered layout.
 * @returns {Layout}
 * @private
 */
function _layout(name) {
    if(layouts.hasOwnProperty(name)){
        return new Layout(name);
    }
    throw new InvalidParamException('Layout with name "' + name + '" is not registered yet.');
}
addEventsImplementation.call(_layout);


/**
 * Registers new layout UI.
 * @param {object} data
 */
_layout.register = function (data) {
    checkUIParameters(data);
    if (uiList.hasOwnProperty(data.name)){
        throw new UIRegistrationException('UI with name "' + data.name + '" already registered.');
    }
    layouts[data.name] = new UI(data);
    _layout.triggerEvent('register', layouts[data.name]);
    return layouts[data.name];
};


/**
 * Renders layout with given name.
 * @param name
 * @param params
 */
_layout.render = function (name, params) {
    var ui = getLayout(name);
    if(ui === null){
        throw new InvalidParamException('Layout with name "' + name + '" is not registered yet.');
    }
    currentLayoutInst = ui.render(params);
    currentLayoutName = name;
};


/**
 * Returns instance of the current layout.
 * @returns {*}
 */
_layout.getInstance = function () {
    return currentLayoutInst;
};


/**
 * Object that provides all necessary methods.
 * Usage: Layout('Main').render();
 * @param name
 * @constructor
 */
function Layout(name) {
    this.name = name;
}
Layout.prototype = {
    constructor: Layout,
    render : function(params){
        var ui = getLayout(this.name);
        currentLayoutInst = ui.render(params);
        currentLayoutName = this.name;
    }
};



_uibuilder.layout = _layout;

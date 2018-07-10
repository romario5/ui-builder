/**
 * Extensions are the special objects that can be applied to the different
 * elements or nodes to extend his own functionality or add some behavior.
 *
 *
 *
 * @param options
 * @constructor
 */
function Extension(options)
{
    this.name = ''; // Name of the extension.
    this.__ = {
        events: {},
        dispatchers: {}
    };

    for (var p in options) {
        if(options.hasOwnProperty(p)){
            if (p.slice(0, 2) === 'on' && typeof options[p] === 'function') {
                this.addEventListener(p.slice(2), options[p]);
            }
        }
    }
}

Extension.prototype = {
    constructor: Extension,

    applyTo : function(target, params){
        if(params === undefined){
            params = {};
        }
        _uibuilder.Extension.triggerEvent('apply', this, target, params);
        this.triggerEvent('apply', target, params);
    }
};

addEventsImplementation.call(Extension.prototype);



var _extensions = {};

/**
 * Returns extension by name.
 * If extension with given name is absent - null will be returned.
 * @param name
 * @returns {*}
 */
_uibuilder.Extension = function(name)
{
    if(_extensions.hasOwnProperty(name)){
        return _extensions[name];
    }
    warn('Extension with name ' + name + ' is not registered yet.');
    return null;
};
addEventsImplementation.call(_uibuilder.Extension);

/**
 * Registers new extension.
 */
_uibuilder.Extension.register = function(options)
{
    checkExtensionParameters(options);
    _extensions[options.name] = new Extension(options);
};


/**
 * Checks parameters that given on the UI registration.
 * @param {object} data
 * @throws ExtensionRegistrationException
 */
function checkExtensionParameters(data)
{
    if (!data.hasOwnProperty('name'))
        throw new ExtensionRegistrationException('Name of a new extension is not defined.');

    if (typeof data.name !== 'string')
        throw new ExtensionRegistrationException('Name of a new extension is ' + (typeof data.name) + '. String required.');

    if (_extensions.hasOwnProperty(data.name))
        throw new ExtensionRegistrationException('Extension with name "' + data.name + '" already registered.');

    if (!data.hasOwnProperty('onapply'))
        throw new ExtensionRegistrationException('"apply" event handler for a new extension "' + data.name + '" is absent.');

    if (typeof data.onapply !== 'function')
        throw new ExtensionRegistrationException('"onapply" event handler for a new extension "' + data.name + '" is ' + (typeof data.onapply) + '. Function required.');
}
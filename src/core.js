/**
 * @var {object} Private variable that stores UIs.
 */
var uiList = {};


/**
 * Exported function.
 * @param {string} name Name of the UI.
 * @return {UI|null}
 */
function _uibuilder(name) {
    if (uiList.hasOwnProperty(name)) {
        return uiList[name];
    }
    return null;
}



/**
 * Adding events support for the UIBuilder.
 */
_uibuilder.__ = {};
_uibuilder.__.events = {};
addEventsImplementation.call(_uibuilder);


/**
 * Returns array of registered UI.
 * @return {Array}
 */
_uibuilder.listUI = function () {
	return Object.keys(uiList);
};


/**
 * Registers new UI.
 * @param data (object)
 * {
 *      name   : (string),
 *      scheme : (object),
 *      rules  : (object)
 * }
 */
_uibuilder.register = function(data) {
	checkUIParameters(data);
	uiList[data.name] = new UI(data);
	_uibuilder.triggerEvent('register', uiList[data.name]);
};



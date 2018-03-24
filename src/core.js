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
 * @var {string} Current application language.
 */
var language = 'en';


/**
 * Sets interface language.
 * @param {string} lang
 */
_uibuilder.setLanguage = function(lang)
{
	language = lang;
};


/**
 * Returns interface language.
 * @return {string}
 */
_uibuilder.getLanguage = function()
{
	return language;
};


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


/**
 * Checks parameters that given on the UI registration.
 */
function checkUIParameters(data)
{
	if (!data.hasOwnProperty('name'))
		throw new UIRegistrationException('Name of a new UI is not defined.');

	if (typeof data.name !== 'string')
		throw new UIRegistrationException('Name of a new UI is ' + (typeof data.rules) + '. String required.');

	if (uiList.hasOwnProperty(data.name))
		throw new UIRegistrationException('UI with name "' + data.name + '" already registered.');

	if (!data.hasOwnProperty('scheme'))
		throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" absent.');

	if (typeof data.scheme !== 'object')
		throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" is ' + (typeof data.scheme) + '. Object required.');

	if (!data.hasOwnProperty('rules')) data.rules = {};

	if (typeof data.rules !== 'object')
		throw new UIRegistrationException('Rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');
}
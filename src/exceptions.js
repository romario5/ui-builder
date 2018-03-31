/**          Exceptions
 * ___________________________
 * ---------------------------
 *
 * This section contains exceptions definition.
 * Each new exception constructor should use base Exception constructor.
 * Use log() function to print exception message in the "cache" section.
 * Also you can use "name" property in your constructor that will be
 * printed after prefix and before main message.
 *
 * Usage example:
 *
 * try{
 *     if( myPlanetForm === 'flat' ) throw new Exception('Earth is flat!');
 * }catch(error){ error.log(); }
 *
 */


/**
 * @var {string} String used as prefix in logging.
 */
var logPrefix = 'UIBuilder >>>';


/**
 * Logs message using console.log(e) function.
 */
function log(message) {
	if (Settings.logging) console.log(logPrefix + ' ' + message);
}


/**
 * Logs message using console.warn() function.
 */
function warn(message) {
	if (Settings.logging) console.warn(logPrefix + ' ' + message);
}


/**
 * Logs message using console.error() function.
 */
function error(message) {
	if (!Settings.logging) return;
	if (typeof message === 'string') {
		console.error(logPrefix + ' ' + message);
	} else if (message instanceof Exception) {
		message.log();
	} else {
		console.error(message);
	}
}


/**
 * Base exception constructor with log() method.
 * @param message (string) - Message of the exception.
 */
function Exception(message) {
	this.message = message;
}

Exception.prototype = {
	log: function () {
		if (!Settings.logging) return;
		if (this.message === '') return; // Exit if nothing to log.

		var message = logPrefix; // Message to be printed into the log.

		if (this.hasOwnProperty('name')) message += ' ' + this.name; // Add name if specified.
		message += ' ' + this.message; // Add message text.

		if (!this.hasOwnProperty('type') || this.type === 'exception') {
			console.error(message);

		} else if (this.type === 'warning') {
			console.warn(message);

		} else {
			console.log(message);
		}
	}
};


function InvalidParamException(message) {
	Exception.call(this, message);
	this.name = 'Invalid parameter.';
}
InvalidParamException.prototype = Exception.prototype;


// Invalid options on UI registration.
function UIRegistrationException(message) {
	Exception.call(this, message);
	this.name = 'UI registration.';
}
UIRegistrationException.prototype = Exception.prototype;


// Invalid options on UI registration.
function ExtensionRegistrationException(message) {
	Exception.call(this, message);
	this.name = 'Extension registration.';
}
ExtensionRegistrationException.prototype = Exception.prototype;


// Exception about invalid scheme structure.
function InvalidSchemeException(message) {
	Exception.call(this, message);
	this.name = 'Invalid scheme.';
}
InvalidSchemeException.prototype = Exception.prototype;


// Error on building UI.
function RenderingException(message) {
	Exception.call(this, message);
	this.name = 'Rendering error.';
}
RenderingException.prototype = Exception.prototype;


// Error on setting parsing rule.
function SettingsException(message) {
	Exception.call(this, message);
	this.type = 'warning';
	this.name = 'Settings error.';
}
SettingsException.prototype = Exception.prototype;


// Error on loading data to the UIInstance.
function UIInstanceLoadException(message) {
	Exception.call(this, message);
	this.name = 'Instance data loading.';
}
UIInstanceLoadException.prototype = Exception.prototype;


// Error on loading data to the UIInstance.
function UIElementLoadException(message) {
	Exception.call(this, message);
	this.name = 'Element data apply.';
}
UIElementLoadException.prototype = Exception.prototype;


function UIDataException(message) {
	Exception.call(this, message);
	this.name = 'UI Data.';
}
UIDataException.prototype = Exception.prototype;


function EventException(message) {
	Exception.call(this, message);
	this.name = 'Events';
}
EventException.prototype = Exception.prototype;
import Settings from './settings';

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
 * Base exception constructor with log() method.
 * @param message (string) - Message of the exception.
 */
export function Exception(message) {
    this.message = message;
}

Exception.prototype = {
    log: function () {
        if (!Settings.logging) return;
        if (this.message === '') return; // Exit if nothing to log.

        let message = logPrefix; // Message to be printed into the log.

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


export function InvalidParamException(message) {
    Exception.call(this, message);
    this.name = 'Invalid parameter.';
}
InvalidParamException.prototype = Exception.prototype;


// Invalid options on UI registration.
export function UIRegistrationException(message) {
    Exception.call(this, message);
    this.name = 'UI registration.';
}
UIRegistrationException.prototype = Exception.prototype;


// Invalid options on UI registration.
export function ExtensionRegistrationException(message) {
    Exception.call(this, message);
    this.name = 'Extension registration.';
}
ExtensionRegistrationException.prototype = Exception.prototype;


// Exception about invalid scheme structure.
export function InvalidSchemeException(message) {
    Exception.call(this, message);
    this.name = 'Invalid scheme.';
}
InvalidSchemeException.prototype = Exception.prototype;


// Error on building UI.
export function RenderingException(message) {
    Exception.call(this, message);
    this.name = 'Rendering error.';
}
RenderingException.prototype = Exception.prototype;


// Error on setting parsing rule.
export function SettingsException(message) {
    Exception.call(this, message);
    this.type = 'warning';
    this.name = 'Settings error.';
}
SettingsException.prototype = Exception.prototype;


// Error on loading data to the UIInstance.
export function UIInstanceLoadException(message) {
    Exception.call(this, message);
    this.name = 'Instance data loading.';
}
UIInstanceLoadException.prototype = Exception.prototype;


// Error on loading data to the UIInstance.
export function UIElementLoadException(message) {
    Exception.call(this, message);
    this.name = 'Element data apply.';
}
UIElementLoadException.prototype = Exception.prototype;


export function UIDataException(message) {
    Exception.call(this, message);
    this.name = 'UI Data.';
}
UIDataException.prototype = Exception.prototype;


export function EventException(message) {
    Exception.call(this, message);
    this.name = 'Events';
}
EventException.prototype = Exception.prototype;
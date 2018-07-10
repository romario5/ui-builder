import Settings from './settings';


/**
 * @var {string} String used as prefix in logging.
 */
let logPrefix = 'UIBuilder >>>';


/**
 * Logs message using console.log(e) function.
 */
export function log(message) {
    if (Settings.logging) console.log(logPrefix + ' ' + message);
}


/**
 * Logs message using console.warn() function.
 */
export function warn(message) {
    if (Settings.logging) console.warn(logPrefix + ' ' + message);
}


/**
 * Logs message using console.error() function.
 */
export function error(message) {
    if (!Settings.logging) return;
    if (typeof message === 'string') {
        console.error(logPrefix + ' ' + message);
    } else if (message instanceof Exception) {
        message.log();
    } else {
        console.error(message);
    }
}
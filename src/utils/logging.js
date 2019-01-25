import Settings from '../core/settings';
import {Exception} from './exceptions';


/**
 * @var {string} String used as prefix in logging.
 */
let logPrefix = 'UI';

let msgFormatter = null;


/**
 * Logs message using console.log(e) function.
 */
export function log(message) {
    let args = Array.prototype.slice.call(arguments);
    if (Settings.logging) console.log.apply(console, msgFormatter(args));
}


/**
 * Logs message using console.warn() function.
 */
export function warn(message) {
    let args = Array.prototype.slice.call(arguments);
    if (Settings.logging) console.warn.apply(console, msgFormatter(args));
}


/**
 * Logs message using console.error() function.
 */
export function error(message) {
    if (!Settings.logging) return;

    let args = Array.prototype.slice.call(arguments);

    if (message instanceof Exception) {
        message.log();
    } else {
        console.error.apply(console, msgFormatter(args));
    }
}



function defaultFormatter(args) {
    args.unshift(logPrefix + ' >');
    return args;
}


function chromeFormatter(args) {
    args.unshift('font-weight: 900');
    args.unshift('%c ' + logPrefix + ' >');
    return args;
}




msgFormatter = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) ? chromeFormatter : defaultFormatter;
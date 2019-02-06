import addEventsMethods from '../utils/events-methods';
import {error} from '../utils/logging';

/**
 * Private object that holds registered events channels.
 * @type {Object}
 */
let channels = {};


/**
 * Class that represents single events channel with name.
 * Usage:
 *
 * // Products channel creation.
 * let prodChannel = new EventsChannel('products');
 *
 * // Somewhere in the product form.
 * ajax.send(response => prodChannel.triggerEvent('update', response));
 *
 * // Somewhere in the products list.
 * prodChannel.on('update', data => list.updateProductInfo(data));
 */
function EventsChannel (name) {
    this.name = name;

    this.__ = {
        events: {},
        dispatchers: {},
        eventsTimeouts: {}
    };
}

// Add events methods to the prototype to prevent code duplicating.
EventsChannel.prototype = {};
addEventsMethods(EventsChannel.prototype);






/**
 * Returns channel by name.
 * For example channel can be created in one place but must be accessed from another one.
 * If channel not exists the new one will be created.
 *
 * Usage:
 * let prodChannel = EventsChannel('products');
 *
 * @param name
 * @return {EventsChannel}
 */
export default function channelsManager (name) {

    if (typeof name !== 'string' && Selection.logging) {
        error('EventsChannel name must be a string but ' + typeof name + ' given.');
        return null;
    }

    if (channels.hasOwnProperty(name)) {
        return channels[name];
    }
    let channel = new EventsChannel(name);
    channels[name] = channel;
    return channel;
}
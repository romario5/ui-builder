import addEventsMethods from '../utils/events-methods';
import {error, warn} from '../utils/logging';
import Settings from '../core/settings';

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
export default function EventsChannel (name) {
    this.name = name;

    if (typeof name !== 'string') {
        error('EventsChannel name must be a string but ' + typeof name + ' given.');
    }

    // If channel with given name already exists - just copy properties references.
    if (channels.hasOwnProperty(name)) {
        let channel = channels[name];
        this.__ = channel.__;

        if (Settings.logging) {
            warn('EventsChannel with name "' + name + '" already exists.');
        }

    // Otherwise register new channel and create necessary properties.
    } else {
        this.__ = {
            events: {},
            dispatchers: {},
            eventsTimeouts: {}
        };
        channels[name] = this;
    }
}

// Add events methods to the prototype to prevent code duplicating.
EventsChannel.prototype = {};
addEventsMethods(EventsChannel.prototype);



/**
 * Static method that used to get channel by name.
 * For example channel can be created in one place but must be accessed from another one.
 * If channel not exists the new one will be created.
 *
 * Usage:
 * let prodChannel = EventsChannel.getByName('products');
 *
 * @param name
 * @return {EventsChannel}
 */
EventsChannel.getByName = function(name) {
    if (channels.hasOwnProperty(name)) {
        return channels[name];
    }
    return new EventsChannel(name);
};



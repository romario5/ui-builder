import addEventsMethods from './events-methods';

/**
 * Simple object helper that manages global events.
 * Usage:
 *
 *  // Add first listener.
 *  GlobalEvents.listen('ws:incomingMessage').onPort(500, message => {
 *      // Do something with message...
 *  });
 *
 *  // Add another event listener.
 *  GlobalEvents.listen('ws:incomingMessage -> 501', message => {
 *      // Do something with message...
 *  });
 *
 *  // Then trigger this event.
 *  GlobalEvents.triggerEvent('ws:incomingMessage', {
 *      author: 'Roman',
 *      text: 'Hello world!'
 *  });
 *
 * @returns {string}
 */
export default function GlobalEvents()
{
    return '1.0.0';
}


addEventsMethods(GlobalEvents);
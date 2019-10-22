import addEventsMethods from '../utils/events-methods';
import {error} from '../utils/logging';

/**
 * Namespace used to union few UIs into one logic part.
 *
 * Example:
 *
 * UI.register({
 *     namespace: 'UBP/chat',
 *
 *     name: 'Panel',
 *
 *     onRender(inst, params) {
 *         this.channel.triggerEvent('render');
 *
 *
 *     }
 * });
 */


let namespaces = {};


export default class Namespace
{
    constructor(name) {
        if (namespaces.hasOwnProperty(name)) {
            error('Namespace "' + name + '" already exists.')
        }

        this.name = name;

        // Create events channel for the namespace.
        this.channel = {};
        addEventsMethods(this.channel);

        namespaces[name] = this;
    }
}


Namespace.exists = function(name) {
    return namespaces.hasOwnProperty(name);
};


Namespace.getOrCreate = function (name) {
    return namespaces.hasOwnProperty(name)
        ? namespaces[name]
        : new Namespace(name);
};
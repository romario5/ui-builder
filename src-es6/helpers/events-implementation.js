/**    Evens implementation
 * ___________________________
 * ---------------------------
 *
 * Implementation of the events.
 * Call this constructor on prototype to add methods.
 * Also instance for which prototype events will be added must has 'events' property.
 * To fire event use triggerEvent method.
 *
 * Example: addEventsImplementation.call(UIElement.prototype);
 */
export default function eventsImplementation()
{
    if(!this.hasOwnProperty('__')){
        this.__ = {events : {}};
    }
    this.__.dispatchers = {};

    /**
     *
     * @param {string|number} eventName
     * @param {function} [handler]
     * @returns {EventsDispatcher}
     */
    this.listen = function (eventName, handler) {
        let portNumber = null;
        let arr = eventName.split('->');
        if(arr.length === 2){
            eventName = arr[0].trim();
            portNumber = arr[1].trim();
        }
        eventName = eventName.toLowerCase();
        if (!this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName] = new EventsDispatcher(eventName);
        }
        if(portNumber !== null && typeof handler === 'function'){
            this.__.dispatchers[eventName].on(portNumber, handler);
        }
        return this.__.dispatchers[eventName];
    };

    /**
     * Adds event listener for the event with name [[eventName]].
     * @param {string} eventName
     * @param {function} handler
     * @throw EventException
     */
    this.addEventListener = function (eventName, handler) {
        eventName = eventName.toLowerCase();
        if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');
        if (!Array.isArray(this.__.events[eventName])) this.__.events[eventName] = [];
        if (this.__.events[eventName].indexOf(handler) >= 0) return;
        this.__.events[eventName].push(handler);
        return this;
    };

    // Add pseudonym.
    this.on = this.addEventListener;


    /**
     * Removes specified event listener.
     * @param {string} eventName
     * @param {function} [handler]
     * @throw EventException
     */
    this.removeEventListener = function (eventName, handler) {
        eventName = eventName.toLowerCase();
        if (!this.__.events.hasOwnProperty(eventName)) return this;
        if(handler === undefined){
            delete this.__.events[eventName];
            this.__.events[eventName] = [];
        }else{
            if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');
            let index = this.__.events[eventName].indexOf(handler);
            if (index < 0) return this;
            this.__.events[eventName].splice(index, 1);
        }
        return this;
    };

    // Add pseudonym.
    this.off = this.removeEventListener;


    /**
     * Triggers event with name [[eventName]].
     * There are few arguments can be passed instead of date.
     * All the arguments (omitting event name) will be passed to the handlers.
     *
     * @param {string} eventName
     * @param {*} [data]
     */
    this.triggerEvent = function (eventName, data) {
        eventName = eventName.toLowerCase();
        let args = [];
        for (let i = 1, len = arguments.length; i < len; i++) {
            args.push(arguments[i]);
        }

        if (!this.__.events.hasOwnProperty(eventName)) return;
        for (let i = 0; i < this.__.events[eventName].length; i++) {
            this.__.events[eventName][i].apply(this, args);
        }

        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].runHandlers(this, args);
        }
    };

    this.offPort = function (eventName, portNumber) {
        if(portNumber === undefined){
            let arr = eventName.split('->');
            if(arr.length === 2){
                eventName = arr[0].trim();
                portNumber = arr[1].trim();
            }
        }
        eventName = eventName.toLowerCase();
        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].offPort(portNumber);
        }
    };

    this.offAllPorts = function (eventName) {
        eventName = eventName.toLowerCase();
        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].offAllPorts();
        }
    };

    this.trigger = this.triggerEvent;
}

/**
 * Object that encapsulates events ports.
 */
class EventsDispatcher {
    constructor (eventName) {
        this.eventName = eventName;
        this.ports = {};
    }

    onPort(portNumber, handler){
        if(this.ports.hasOwnProperty(portNumber)){
            delete this.ports[portNumber];
        }
        if(typeof handler !== 'function'){
            throw new EventException('Type of handler is not a function');
        }
        this.ports[portNumber] = handler;
    }

    runHandlers(context, args){
        for(let p in this.ports){
            if(this.ports.hasOwnProperty(p)){
                this.ports[p].apply(context, arguments);
            }
        }
    }

    offPort(portNumber){
        if(this.ports.hasOwnProperty(portNumber)){
            delete this.ports[portNumber];
        }
    }

    offAllPorts(){
        delete this.ports;
        this.ports = {};
    }
}
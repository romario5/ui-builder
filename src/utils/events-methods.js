/**
 * Implementation of the events.
 * Call this constructor on prototype to add methods.
 * Also instance for which prototype events will be added must has 'events' property.
 * To fire event use triggerEvent method.
 *
 * Example: addEventsMethods(UIElement.prototype);
 *
 *
 * Usage of the events:
 *
 * // Handler added on the port 1.
 * instance.on('newMessage -> 1', msg => doSomething(msg));
 *
 * // Remove all handlers and add new one.
 * instance.offAllPorts().on('change -> profile', data => doSomething(data));
 */
export default function addEventsMethods(target)
{
    // Ensure that object-container is exists.
    if(!target.hasOwnProperty('__')){
        target.__ = {};
    }
    target.__.events = {};
    target.__.dispatchers = {};
    target.__.eventsTimeouts = {};

    /**
     * Adds event listener but returns dispatcher.
     * @param {string|number} eventName
     * @param {function} [handler]
     * @returns {EventsDispatcher}
     */
    target.listen = function (eventName, handler) {
        let port = null;
        let arr = eventName.split('->');
        if(arr.length === 2){
            eventName = arr[0].trim();
            port = arr[1].trim();
        }
        eventName = eventName.toLowerCase();
        if (!this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName] = new EventsDispatcher(eventName);
        }
        if(port !== null && typeof handler === 'function'){
            this.__.dispatchers[eventName].on(port, handler);
        }
        return this.__.dispatchers[eventName];
    };

    /**
     * Adds event listener for the event with name [[eventName]].
     * @param {string} eventName
     * @param {function} handler
     * @returns {*}
     * @throw EventException
     */
    target.addEventListener = function (eventName, handler) {
        let portNumber = null;
        let arr = eventName.split('->');
        if(arr.length === 2){
            eventName = arr[0].trim();
            portNumber = arr[1].trim();
        }
        eventName = eventName.toLowerCase();
        if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');

        if(portNumber !== null){
            this.listen(eventName).onPort(portNumber, handler);
        }else{
            if (!Array.isArray(this.__.events[eventName])) this.__.events[eventName] = [];
            if (this.__.events[eventName].indexOf(handler) >= 0) return;
            this.__.events[eventName].push(handler);
        }

        return this;
    };

    // Add pseudonym.
    target.on = target.addEventListener;


    /**
     * Removes specified event listener.
     * @param {string} eventName
     * @param {function} [handler]
     * @throw EventException
     */
    target.removeEventListener = function (eventName, handler) {
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
    target.off = target.removeEventListener;


    /**
     * Triggers event with name [[eventName]].
     * There are few arguments can be passed instead of date.
     * All the arguments (omitting event name) will be passed to the handlers.
     * To trigger event with delay use next syntax:
     *   target.triggerEvent('change ~250');
     *
     * In the example above '~250' means that event will be triggered with delay in 250 milliseconds.
     *
     * @param {string} eventName
     * @param {*} [data]
     */
    target.triggerEvent = function (eventName, data) {
        eventName = eventName.toLowerCase();

        let delay = 0;
        let arr = eventName.split('~');
        if (arr.length > 1) delay = parseInt(arr[1].trim());
        eventName = arr[0].trim();

        let args = [];
        for (let i = 1, len = arguments.length; i < len; i++) {
            args.push(arguments[i]);
        }

        // Interrupt all delayed events.
        if (this.__.eventsTimeouts !== undefined) {
            clearTimeout(this.__.eventsTimeouts[eventName]);
        }

        if (this.__.dispatchers.hasOwnProperty(eventName)) {
            if (delay > 0) {
                this.__.eventsTimeouts[eventName] = setTimeout(function (_this, eventName, args) {
                    _this.__.dispatchers[eventName].runHandlers(_this, args);
                }, delay, this, eventName, args);
            } else {
                this.__.dispatchers[eventName].runHandlers(this, args);
            }
        }

        if (!this.__.events.hasOwnProperty(eventName)) return;

        if (delay > 0) {
            this.__.eventsTimeouts[eventName] = setTimeout(function (_this, eventName, args) {
                for (let i = 0; i < _this.__.events[eventName].length; i++) {
                    _this.__.events[eventName][i].apply(_this, args);
                }
            }, delay, this, eventName, args);
        } else {
            for (let i = 0; i < this.__.events[eventName].length; i++) {
                this.__.events[eventName][i].apply(this, args);
            }
        }
    };


    /**
     * Interrupts all delayed events with given name.
     * @param eventName
     * @return {target}
     */
    target.interruptEvent = function (eventName) {
        clearTimeout(this.__.eventsTimeouts[eventName]);
        return this;
    };


    /**
     * Removes handler of the given event from the given port.
     * @param eventName {string}
     * @param port {string}
     */
    target.offPort = function (eventName, port) {
        if(port === undefined){
            let arr = eventName.split('->');
            if(arr.length === 2){
                eventName = arr[0].trim();
                port = arr[1].trim();
            }
        }
        eventName = eventName.toLowerCase();
        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].offPort(port);
        }
    };

    target.offAllPorts = function (eventName) {
        eventName = eventName.toLowerCase();
        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].offAllPorts();
        }
    };

    target.trigger = target.triggerEvent;
}


/**
 * Object that encapsulates events ports.
 * Port is like named event handler.
 * It's useful when one event handler must be replaced with another one
 * when link on the previous handler is absent.
 * Also ports can be used with entity ids (to attach handler for some id).
 */
class EventsDispatcher
{
    constructor (eventName) {
        this.eventName = eventName;
        this.ports = {};
    }

    /**
     * Attaches handler on the given port.
     * @param port {string}
     * @param handler {function}
     */
    onPort(port, handler){
        if(this.ports.hasOwnProperty(port)){
            delete this.ports[port];
        }
        if(typeof handler !== 'function'){
            throw new EventException('Type of handler is not a function');
        }
        this.ports[port] = handler;
    }

    /**
     * Runs all handlers (all ports).
     * Binds context as [this] and passes arguments to the handlers.
     * @param context {object}
     * @param args {array}
     */
    runHandlers(context, args){
        for(let p in this.ports){
            if(this.ports.hasOwnProperty(p)){
                this.ports[p].apply(context, args);
            }
        }
    }

    /**
     * Removes event handler from the given port.
     * @param port {string}
     */
    offPort(port){
        if (this.ports.hasOwnProperty(port)) {
            delete this.ports[port];
        }
    }

    /**
     * Removes all event handlers.
     */
    offAllPorts(){
        delete this.ports;
        this.ports = {};
    }
}
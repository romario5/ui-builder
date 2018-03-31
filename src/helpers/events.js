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
function addEventsImplementation()
{
	if(!this.hasOwnProperty('__')){
        this.__ = {events : {}};
	}


	/**
	 * Adds event listener for the event with name [[eventName]].
	 * @param {string} eventName
	 * @param {function} handler
	 * @throw EventException
	 */
	this.addEventListener = function (eventName, handler) {
		if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');
		if (!this.__.events.hasOwnProperty(eventName)) this.__.events[eventName] = [];
		if (this.__.events[eventName].indexOf(handler) >= 0) return;
		this.__.events[eventName].push(handler);
		return this;
	};

	// Add pseudonym.
	this.on = this.addEventListener;


	/**
	 * Removes specified event listener.
	 * @param {string} eventName
	 * @param {function} handler
	 * @throw EventException
	 */
	this.removeEventListener = function (eventName, handler) {
		if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');
		if (!this.__.events.hasOwnProperty(eventName)) return;
		var index = this.__.events[eventName].indexOf(handler);
		if (index < 0) return;
		this.__.events[eventName].splice(index, 1);
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
	 * @param data
	 */
	this.triggerEvent = function (eventName, data) {
		var args = [];
		for (var i = 1, len = arguments.length; i < len; i++) {
			args.push(arguments[i]);
		}

		if (!this.__.events.hasOwnProperty(eventName)) return;
		for (i = 0; i < this.__.events[eventName].length; i++) {
			this.__.events[eventName][i].apply(this, args);
		}
	};

	this.trigger = this.triggerEvent;
}


/**
 * Custom event constructor.
 */
function UIEvent(type) {
	this.type = type === undefined ? 'empty' : type;
	this.canceled = false;
	this.defaultPrevented = false;
	this.target = null;
}

UIEvent.prototype.preventDefault = function () {
	this.canceled = true;
	this.defaultPrevented = true;
};
_uibuilder.Event = UIEvent;
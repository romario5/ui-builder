/**
 *          UIElement
 * ___________________________
 * ---------------------------
 *
 *
 * UIElement is an wrap that represents nodes inside UI instances.
 * To keep main conception "All in one" UIElement provides few useful
 * methods with jQuery syntax.
 *
 * Besides native events there are few custom events are available:
 * - load (except img, iframe and video tags)
 * - gather (when gatherData() method is called, but before gathering actually starts)
 *
 * Constructor of the elements that UIInstance contains within.
 * @param {object} params
 * @constructor
 *
 * @see UI
 * @see UIInstance
 * @see load()
 * @see gatherData()
 */
function UIElement(params){
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value: {},
		configurable: false,
		enumerable: false,
		writeable: false
	});

	// set parameters
	this.__.name = params.name !== undefined ? params.name : null;
	this.__.child = params.child !== undefined ? params.child : null;
	this.__.class = params.class !== undefined ? params.class : null;
	this.__.id = params.id !== undefined ? params.id : null;
	this.__.tag = params.tag !== null && params.tag !== undefined ? params.tag.toLowerCase() : 'div';
	this.__.inclusion = null;

	// Create node.
	if (this.__.tag === '') this.__.tag = 'div';
	this.__.node = document.createElement(this.__.tag);
	this.__.parent = null;
	this.__.uiinstance = null;
	this.__.node.uiinstance = null;
	this.__.node.uielement = this;

	// Dragging options.
	this.__.draggable = false;
	this.__.dragX = false;
	this.__.dragY = false;
	this.__.isDragging = false;
	this.__.dragWithinParent = false;
	this.__.dragBoundaries = false;
	this.__.localization = null;
	this.__.translation = null;


	// Tabs behaviour properties.
	this.__.tabContainer = null;

	this.__.animation = null;
	this.__.fx = null;

	// Set data collector.
	// Not used at the moment.
	// Desired behavior it's to link data provider with element to
	// update data automatically.
	this.__.data = params.data === undefined ? null : params.data;

	// Children is an array for the instances of child UI or inclusions (defined in the scheme as '|item' for example).
	// Do NOT add single child elements or other.
	this.__.children = [];

	// Events handlers container.
	this.__.events = {};

	var p;
	// Attach attributes.
	for (p in params.attributes) {
	    if(params.attributes.hasOwnProperty(p)){
            this.__.node.setAttribute(p, params.attributes[p]);
        }
	}

	// Set properties.
	for (p in params.properties) {
	    if(params.properties.hasOwnProperty(p)){
            // Use prototype method if available.
            if (UIElement.prototype.hasOwnProperty(p) && typeof UIElement.prototype[p] === 'function') {
                UIElement.prototype[p].call(this, params.properties[p]);

                // Otherwise set node properties directly.
            } else {
                this.__.node[p] = params.properties[p];
            }
        }
	}

	// set class and id
	if (typeof this.__.class === 'string') this.__.node.className = this.__.class;
	if (typeof this.__.id === 'string') this.__.node.id = this.__.id;
}


/**
 * Checks whether subject is element of the UI instance.
 * @param subject
 * @return {boolean}
 */
_uibuilder.isElement = function(subject){
	return subject instanceof UIElement;
};


UIElement.prototype = {constructor: UIElement};



UIElement.prototype.applyLocalization = function (localization, translation) {
	this.__.node.setAttribute('localization', localization);
	this.__.node.T = translation;
	return this;
};

/**
 * Checks if element has child UI.
 * @return {boolean}
 */
UIElement.prototype.hasChildUI = function () {
	return this.__.child !== null;
};


UIElement.prototype.node = function(){
	return this.__.node;
};

UIElement.prototype.scrollTop = function(value){
	if(value === undefined){
		return this.__.node.scrollTop;
	}
	this.__.node.scrollTop = value;
	return this;
};

UIElement.prototype.scrollHeight = function(){
	return this.__.node.scrollHeight;
};

UIElement.prototype.node = function(){
	return this.__.node;
};

/**
 * Sets child UI.
 * @param {string|UI} ui
 * @return {UIElement} (itself)
 */
UIElement.prototype.setChildUI = function (ui) {
	if (typeof ui === 'string') {
		this.__.child = ui;
	} else if (ui instanceof UI) {
		this.__.child = ui.name;
	}
	return this;
};


/**
 * Checks if element includes another ui instance.
 * @return {boolean}
 */
UIElement.prototype.hasInclusion = function () {
	return this.__.inclusion !== null
		&& this.__.children.length === 1
		&& this.__.children[0] instanceof UIInstance;
};


/**
 * Finds parent element (UIElement) inside own UIInstance.
 * If element has no local parent null will be returned.
 * @return {UIElement|null}
 */
UIElement.prototype.findTopLocalParent = function () {
	var p = this;
	while (p instanceof UIElement) {
		if (p.__.parent === null) break;
		if (p.__.parent instanceof UIElement && p.__.parent.__.uiinstance === this.__.uiinstance) {
			p = p.__.parent;
		} else {
			break;
		}
	}

	if (p === this) return null;
	return p;
};


UIElement.prototype.inclusion = function () {
	return this.__.inclusion;
};


UIElement.prototype.UII = function () {
	return this.__.uiinstance;
};


UIElement.prototype.parent = function () {
	return this.__.parent;
};


UIElement.prototype.parentUII = function () {
	return this.UII() === null ? null : this.UII().parentUII();
};

UIElement.prototype.children = function () {
	return this.__.children;
};


/**
 * Returns all child elements even if they are not instances of the child UI.
 * @return {UIElement[]}
 */
UIElement.prototype.getAllChildElements = function()
{
	var c = this.__.node.childNodes;
	var res = [];
	for(var i = 0, len = c.length; i < len; i++){
		if(c[i].uielement instanceof UIElement) res.push(c[i].uielement);
	}
	return res;
};


/**
 * Returns all nearby elements (siblings) even if they are not instances of the child UI.
 * @return {UIElement[]}
 */
UIElement.prototype.getAllNearbyElements = function()
{
	var c = this.__.node.parentNode.childNodes;
	var res = [];
	for(var i = 0, len = c.length; i < len; i++){
		if(c[i].uielement instanceof UIElement && c[i].uielement !== this) res.push(c[i].uielement);
	}
	return res;
};


/**
 * List of events that will be attached directly to the node.
 * @type {[*]}
 */
var nativeEvents = ['submit', 'abort', 'beforeinput', 'blur', 'click', 'compositionen',
	'compositionstart', 'compositionupdate', 'dblclick', 'error', 'focus', 'change',
	'focusin', 'focusout', 'input', 'keydown', 'keypress', 'keyup', 'load',
	'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mousewheel',
	'mouseup', 'resize', 'scroll', 'select', 'unload', 'wheel', 'touchstart', 'touchend', 'touchmove'
];


/**
 * Implements specific events stystem.
 * UIElements need to handle native JS events so
 * do NOT use [addEventsImplementation] for UIElement!
 */
UIElement.prototype.addEventListener = function (eventName, callback) {
	if(typeof callback !== 'function'){
		error('Invalid callback type given for the event "'+ eventName + '".');
		return;
	}
	if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
	if (!this.__.events.hasOwnProperty(eventName)) this.__.events[eventName] = [];

	// Exit if handler is already added.
	if (this.__.events[eventName].indexOf(callback) >= 0) {
		warn('Handler for the event "' + eventName + '" already added.');
		return this;
	}

	this.__.events[eventName].push(callback);

	if (nativeEvents.indexOf(eventName) >= 0) {
		this.__.node.addEventListener(eventName, runUIElementHandlers);
	}

	return this;
};

UIElement.prototype.on = UIElement.prototype.addEventListener;


UIElement.prototype.removeEventListener = function (eventName, callback) {
	if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
	if (!this.__.events.hasOwnProperty(eventName)) return this;

	var index = this.__.events[eventName].indexOf(callback);
	if (index < 0) return this;
	this.__.events[eventName].splice(index, 1);
	return this;
};

UIElement.prototype.removeAllEventListeners = function (eventName) {
	if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
	if (!this.__.events.hasOwnProperty(eventName)) return this;
	this.__.events[eventName] = null;
	delete this.__.events[eventName];
	this.__.node.removeEventListener(eventName, runUIElementHandlers);
	return this;
};

UIElement.prototype.off = function (eventName, callback) {
	if (callback !== undefined) {
		this.removeEventListener(eventName, callback);
	} else {
		this.removeAllEventListeners(eventName);
	}
	return this;
};


UIElement.prototype.triggerEvent = function (eventName, data) {
	var args = [], i;
	for (i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
	if (!this.__.events.hasOwnProperty(eventName)) return this;

	var handlers = this.__.events[eventName];
	for (i = 0; i < handlers.length; i++) {
		handlers[i].apply(this, args);
	}
};

function runUIElementHandlers(e) {
	var handlers = this.uielement.__.events[e.type];
	for (var i = 0; i < handlers.length; i++) {
		handlers[i].call(this.uielement, this.uiinstance, e);
	}
}


/**
 * Removes all children.
 */
UIElement.prototype.removeChildren = function () {
	for (var i = 0, len = this.__.children.length; i < len; i++) {
		this.__.children[0].remove();
	}
	this.__.children = [];
};


/**
 * Removes UIElement instance from the parent.
 */
UIElement.prototype.remove = function () {
	if (this.__.node.parentNode === null) return;
    this.__.node.parentNode.removeChild(this.__.node);
    delete this.__.node.uiinstance[this.__.name];
};


/**
 * Adds one instance of child UI to the element.
 * @param atStart (bool) - If true, builds UI at the start of the list
 * @param params (array) - Parameters of the newly created UI.
 * @returns {UIInstance} - New instance of the UI, that was appended to the UIElement.node
 */
UIElement.prototype.addOne = function (atStart, params) {
	if (typeof params !== 'object') {
		params = typeof atStart === 'object' ? atStart : {};
	}
	atStart = typeof atStart === 'boolean' ? atStart : false;
	if (this.__.child === null) return null;
	var ui = _uibuilder(this.__.child);
	if (ui === null) return null;
	return this.add(ui, atStart, params);
};


/**
 * Renders UI inside element (itself).
 * @param {UI|string} ui
 * @param {boolean} atStart if true new elements will be added at start. Default is false.
 * @param params
 * @return {UIInstance}
 */
UIElement.prototype.add = function (ui, atStart, params) {
	if (atStart === undefined || atStart === null) atStart = false;

	if (typeof ui === 'string') {
	    ui = _uibuilder(ui);
		if (ui === null) {
			throw new InvalidParamException('UI with name ' + ui + ' is absent.');
		}
	}

	if (!ui instanceof UI) {
		throw new InvalidParamException('First argument of the add() method must be UI or string');
	}
	var instance = ui.renderTo(this, atStart, params);

	instance.__.parent = this;
	return instance;
};


/**
 * Functions to manage properties like in jQuery but working
 * with UIElement instances.
 */
UIElement.prototype.html = function (html) {
	if (html === undefined) return this.__.node.innerHTML;
	this.__.node.innerHTML = html;
	return this;
};
UIElement.prototype.text = function (text) {
	if (text === undefined) return this.__.node.textContent;
	this.__.node.textContent = text;
	return this;
};
UIElement.prototype.attr = function (name, value) {
	if (value === undefined) {
		// Ensure to return correct value (empty string by DOM specification) if attribute is not defined.
		if (!this.__.node.hasAttribute(name)) return '';
		return this.__.node.getAttribute(name);
	}
	this.__.node.setAttribute(name, value);
	return this;
};

UIElement.prototype.hasAttr = function (name) {
	return this.__.node.hasAttribute(name);
};


UIElement.prototype.prop = function (name, value) {
	if (value === undefined) return this.__.node[name];
	this.__.node[name] = value;
	return this;
};
UIElement.prototype.val = function (val) {
	if (val === undefined) return this.__.node.value;
	this.__.node.value = val;
	return this;
};
UIElement.prototype.src = function (val) {
	if (val === undefined) return this.__.node.src;
	this.__.node.src = val;
	return this;
};
UIElement.prototype.href = function (val) {
	if (val === undefined) return this.__.node.href;
	this.__.node.href = val;
	return this;
};
UIElement.prototype.getContext = function (val) {
	if (val === undefined) return this.__.node.getContext('2d');
	return this.__.node.getContext(val);
};
UIElement.prototype.width = function (val) {
	if (val === undefined) return this.__.node.width;
	this.__.node.width = val;
	return this;
};
UIElement.prototype.height = function (val) {
	if (val === undefined) return this.__.node.height;
	this.__.node.height = val;
	return this;
};


UIElement.prototype.outerWidth = function () {
	return this.__.node.offsetWidth;
};

UIElement.prototype.outerHeight = function () {
	return this.__.node.offsetHeight;
};

UIElement.prototype.hide = function() {
	if (this.__.node.style.display === 'none') return this;
	this.__.node.oldDisplay = this.__.node.style.display;
	this.__.node.style.display = 'none';
	return this;
};
UIElement.prototype.show = function () {
	if (this.__.node.style.display !== 'none' && this.__.node.offsetParent !== null) return this;
	if (this.__.node.hasOwnProperty('oldDisplay') && this.__.node.oldDisplay !== 'none') {
		this.__.node.style.display = this.__.node.oldDisplay;
	} else {
		this.__.node.style.display = 'flex';
	}
	return this;
};


UIElement.prototype.isHidden = function () {
	var style = this.computedStyle();
	return style.display === 'none';
};

UIElement.prototype.isVisible = function () {
	var style = this.computedStyle();
	return style.display !== 'none' && style.visibility !== 'hidden';
};


UIElement.prototype.contentHeight = function () {
	var node = this.__.node;
	// Store initial height styles.
	var h = node.style.cssText.match(/height\s*:\s*[\d\w%]+/i);
	h = h === null ? '' : h[0];
	// Set height to auto and store inner height.
	node.style.height = 'auto';
	//var height = node.clientHeight;
	var height = parseInt(window.getComputedStyle(node).getPropertyValue('height').replace(/[^.\d]/i, ''));
	// Restore height style.
	node.style.cssText = node.style.cssText.replace(/height\s*:\s*auto/i, h);
	return height;
};


/**
 * Slides down element with specified duration.
 * @param {number} duration Animation duration in milliseconds (default is 250).
 * @param {function} callback Function that will be called when animation will be finished.
 * @return {UIElement} (itself)
 */
UIElement.prototype.slideDown = function (duration, callback) {
	if (typeof duration !== 'number') duration = 250;

	if(this.isHidden()) this.css({'height' : 0});
	this.css({overflow : 'hidden', display : 'flex'});

	this.animate({height: this.contentHeight()}, duration, function () {
		this.css({height: 'auto'});
		if(typeof callback === 'function') callback.call(this);
	});
	this.__.fx = 'slideDown';

	return this;
};




/**
 * Slides up element with specified duration.
 * @param {number} duration Animation duration in milliseconds (default is 250).
 * @param {function} callback Function that will be called when animation will be finished.
 * @return {UIElement} (itself)
 */
UIElement.prototype.slideUp = function (duration, callback) {
	// Exit if element is already expanded.
	if (this.outerHeight() === 0 || this.isHidden()) return this;

	if (typeof duration !== 'number') duration = 250;

	this.animate({height: 0}, duration, callback);
	this.__.fx = 'slideUp';

	return this;
};


/**
 * Slides up element with specified duration.
 * @param {number} duration Animation duration in miliseconds (default is 250).
 * @param {function} callback Function that will be called when animation will be finished.
 * @return {UIElement} (itself)
 */
UIElement.prototype.slideToggle = function (duration, callback) {
	if (typeof duration !== 'number') duration = 250;

	// Exit if element is already collapsed.
	if (this.node().clientHeight === 0 || this.isHidden() || this.__.fx === 'slideUp') {
		this.slideDown(duration, callback);
	} else {
		this.slideUp(duration, callback);
	}

	return this;
};


UIElement.prototype.hasClass = function (className) {
	return this.__.node.classList.contains(className);
};


UIElement.prototype.addClass = function (className) {
	if (typeof className === 'string') {
		this.__.node.classList.add(className);
	} else if (Array.isArray(className)) {
		for (var i = 0; i < className.length; i++) {
			this.__.node.classList.add(className[i]);
		}
	} else {
		return this;
	}

	this.__.class = this.__.node.className;
	return this;
};


UIElement.prototype.removeClass = function (className) {
	if (typeof className === 'string') {
		this.__.node.classList.remove(className);
	} else if (Array.isArray(className)) {
		for (var i = 0; i < className.length; i++) {
			this.__.node.classList.remove(className[i]);
		}
	} else {
		return this;
	}

	this.__.class = this.__.node.className;
	return this;
};


UIElement.prototype.toggleClass = function (className) {
	this.__.node.classList.toggle(className);
	this.__.class = this.__.node.className;
	return this;
};


UIElement.prototype.css = function (style) {
	if (typeof style === 'string') {
		var s = this.computedStyle();
		var val = s.hasOwnProperty(style) ? s[style] : null;
		if (val !== null && val.indexOf('px') >= 0) val = parseFloat(val.replace('px', ''));
		return val;

	} else if (typeof style === 'object') {
		for (var p in style) {
			if(style.hasOwnProperty(p)) this.__.node.style[p] = style[p];
		}
	}

	return this;
};


UIElement.prototype.clientRect = function () {
	return this.__.node.getBoundingClientRect();
};


UIElement.prototype.tagName = function () {
	return this.__.node.tagName;
};


UIElement.prototype.computedStyle = function () {
	return getComputedStyle(this.__.node);
};


/**
 * Smoothly shows element by changing opacity over the time.
 * @param {number} duration Fading duration in milliseconds.
 * @param {string|number} displayAs If set will be used to set display
 * css property before animation start.
 * @param {function|number} callback
 * @returns {UIElement} (itself)
 * @see fadeOut()
 * @see fadeToggle()
 */
UIElement.prototype.fadeIn = function (duration, displayAs, callback) {
	if (typeof duration === 'string' && displayAs === undefined) {
		displayAs = duration;
	}else if(typeof duration === 'function' && callback === undefined){
		callback = duration;
	}else if(typeof displayAs === 'function' && callback === undefined){
		callback = displayAs;
	}


	// Default duration.
	if (typeof duration !== 'number') duration = 250;

	if (this.isVisible() && this.css('opacity') === 1) return this;
	if (displayAs !== undefined) this.css({display: displayAs});
	this.animate({opacity: 1}, duration, callback);
	this.__.fx = 'fadeIn';
	return this;
};


/**
 * Smoothly hides element by changing opacity over the time.
 * @param {int} duration Fading duration in miliseconds.
 * @param {boolean} hideOnEnd If true the css display property will be set to 'none'
 * on animation finish.
 * @param {function} callback
 * @returns {UIElement} (itself)
 * @see fadeIn()
 * @see fadeToggle()
 */
UIElement.prototype.fadeOut = function (duration, hideOnEnd, callback) {
	if (this.isHidden() || this.css('opacity') === 0) return this;

	if(typeof duration === 'function' && callback === undefined){
		callback = duration;
	}else if(typeof hideOnEnd === 'function' && callback === undefined){
		callback = hideOnEnd;
	}

	// Default duration.
	if (typeof duration !== 'number') duration = 250;

	// Default duration.
	if (hideOnEnd === undefined) hideOnEnd = true;

	this.animate({opacity: 0}, duration, callback);
	this.__.fx = 'fadeOut';

	var el = this;

	if (hideOnEnd) {
		setTimeout(function () {
			el.css({display: 'none'});
		}, duration);
	}
	return this;
};


/**
 * Toggles fading effect.
 * @param {int} duration Fading duration in milliseconds.
 * @param {string} displayAs If set will be used to set display
 * CSS property before animation start in case of fadeIn() method will be applied.
 * If fadeOut() method and displayAs property is specified - element will be hidden after
 * animation finish.
 * @param {function} callback
 * @returns {UIElement} (itself)
 * @see fadeIn()
 * @see fadeOut()
 */
UIElement.prototype.fadeToggle = function (duration, displayAs, callback) {
	if (this.isHidden() || this.css('opacity') === 0 || this.__.fx === 'fadeOut') {
		this.fadeIn(duration, displayAs, callback);
	} else {
		this.fadeOut(duration, displayAs, callback);
	}
	return this;
};


/**
 * Animates CSS properties of the object.
 * @param {object} props Object with animated properties.
 * Keys are properties names and values are the end values.
 * @param {number} duration Duration in milliseconds.
 * @param {function} callback Function that will be called when animation will be finished.
 * @return {UIElement} (itself)
 * @see Animation
 */
UIElement.prototype.animate = function (props, duration, callback) {
	var el = this;
	var startVals = {};
	var endVals = props;
	var units = {};

	// Get initial values.
	var styles = this.computedStyle();
	for (var p in endVals) {

		units[p] = styles[p].replace(/[-\d.]/g, '');
		startVals[p] = parseFloat(styles[p].toString().replace(/[^-\d.]/gi, ''));
		if((p === 'width' || p === 'maxWidth' || p === 'minWidth') && (endVals[p] + "").indexOf('%') > 0){
			units[p] = '%';
			startVals[p] = startVals[p] / this.__.node.parentNode.offsetWidth * 100;
		}else if((p === 'height' || p === 'maxHeight' || p === 'minHeight') && (endVals[p] + "").indexOf('%') > 0){
			units[p] = '%';
			startVals[p] = startVals[p] / this.__.node.parentNode.offsetHeight * 100;
		}
		endVals[p] = parseFloat(endVals[p].toString().replace(/[^-\d.]/gi, ''));
	}

	/*
	 console.log(startVals);
	 console.log(endVals);
	 */

	this.stopAnimation();

	// Create new animation.
	var ani = new Animation({
		duration: duration,
		f: 'easeInOutQuad'
	});

	this.__.animation = ani;


	// Run animation.
	this.__.animation.run(function (k, isEnd) {
		if (el.__.animation !== ani || el.__.animation.stopped) return;
		var diff, cssObj = {};
		for (var p in endVals) {
			var k2 = k;
			diff = endVals[p] - startVals[p];


			if (diff === 0) continue;
			//console.log(parseFloat((diff * k2).toFixed(5)) + startVals[p]);
			cssObj[p] = parseFloat((diff * k2).toFixed(5)) + startVals[p] + units[p];
		}
		el.css(cssObj);
		if (isEnd) {
			if (typeof callback === 'function') callback.call(el);
			el.stopAnimation();
		}
	});
	return this;
};


/**
 * Stops current animation and set [[animation]] property to null.
 * @return {UIElement} (itself)
 */
UIElement.prototype.stopAnimation = function () {
	if (this.__.animation !== null) this.__.animation.stop();
	this.__.animation = null;
	this.__.fx = null;
	return this;
};


/**
 * Loads data into element.
 *
 * @param data Data to be loaded into the element and/or children.
 * If [[data]] is object - all nested elements will be loaded with nested data.
 * String will be used as innerHTML.
 * Array produces child instances if child UI is specified for the element.
 *
 * @param {boolean} [replace] If true - existing content of the element will be deleted before loading.
 *
 * @param {boolean} [atStart] If new content will be inserted at the start of the element. Default is false.
 * This argument will be ignored if [[replace]] is true.
 *
 * @return {UIElement}
 */
UIElement.prototype.load = function (data, replace, atStart) {
	// Set default values.
	if (typeof replace !== 'boolean') replace = true;
	if (typeof atStart !== 'boolean') atStart = false;

	// If UIData (data provider) is given through "data" argument
	// use fetch() method and then load given data using load() method.
	if (data instanceof UIData) {

		return data.fetch(function (replace, atStart, response) {
			this.load(response, replace, atStart);
		}.bind(this, replace, atStart));

	} else {

		var deleteContent = true;

		if (this.inclusion() === null) {
			if (typeof data === 'object' && !Array.isArray(data)) {
				deleteContent = false;
				for (var p in data) {
					if (!UIElement.prototype.hasOwnProperty(p) && !uiList.hasOwnProperty('p')) {
						deleteContent = true;
						break;
					}
				}
			}
		} else {
			deleteContent = false;
		}

		// Remove all children if "replace" argument is true.
		if (replace === true && deleteContent) {
			this.removeChildren();
			this.html('');
		}
	}

	// Trigger 'load' event if any element wants to handle it with specific logic.
	var event = new UIEvent('load');
	event.target = this;
	this.triggerEvent('load', data, event);

	// Stop loading if event was cancelled by preventDefault() method.
	if (event.canceled) return this;

	// If data is string - use is as innerHTML (for <img/> "src" attribute will be used).
	if (typeof data === 'string' || typeof data === 'number') {

		var tagName = this.tagName();

		if (tagName === 'IMG' || tagName === 'VIDEO' || tagName === 'IFRAME') {
			this.src(data);
		} else {
			if (tagName === 'INPUT' || tagName === 'SELECT') {
				this.val(data);
			} else {
				this.text(data);
			}

		}

	} else if (typeof data === 'object') {

		if (this.inclusion() !== null) {
			this.inclusion().load(data, replace, atStart);
			return this;
		}

		// If array given - render child UI for each array element and load it into new instance.
		if (Array.isArray(data)) {

			if (this.__.child === null) {
				warn('Trying to load children for UIElement "' + this.__.name + ' @ ' + this.__.uiinstance.__.ui.name + '" without child UI.');
				return this;
			}

			var child;
			for (var i = 0; i < data.length; i++) {
				try {
					child = this.addOne(atStart);
					child.load(data[i], replace, atStart);
				} catch (exception) {
					// Re-throw exception up.
					throw exception;
				}
			}

			// If data is object - load it into the child elements or use as properties of the current.
		} else {

			for (var p in data) {

				// Load children ...
				if (p === 'children' && Array.isArray(data[p]) && this.hasChildUI()) {
					this.load(data[p], replace, atStart);

					// ... or execute prototype method ...
				} else if (UIElement.prototype.hasOwnProperty(p) && typeof UIElement.prototype[p] === 'function') {
					UIElement.prototype[p].call(this, data[p]);

					// ... otherwise render new UI.
				} else {
					var ui = _uibuilder(p);
					if (ui !== null) {
						ui.renderTo(this).load(data[p], replace, atStart);
					}
				}
			}

		}

	} else {
		throw new UIElementLoadException('Unsupported data type given (' + typeof data + '). Only string or object can be used.');
	}

	this.triggerEvent('afterload');
	return this;
};


/**
 * Resets values of the inputs/selects inside the UIElement.
 * @param {boolean} compact
 * @returns {{}}
 */
UIElement.prototype.resetValues = function (compact) {

};


/**
 * Gathers data of the UIElement.
 * @param {boolean} [compact]
 * @returns {{}}
 */
UIElement.prototype.gatherData = function (compact) {
	if (compact === undefined) compact = true;
	var data = {};

    var event = new Event('gather');
    this.triggerEvent('gather', data, event);

	gatherElementData(this, data, data, null, true);
	if (compact) compactData(data);
	return data;
};


/**
 * @param target
 * @param data
 * @param curData
 * @param propName
 * @param gatherChildNodes
 * @returns {*}
 */
function gatherElementData(target, data, curData, propName, gatherChildNodes) {
	if (typeof curData !== 'object') curData = data;
	var children;
	var name = null;

	if (target.hasAttr('name')) {
		name = target.attr('name');

		var event = new Event('gather');
		target.triggerEvent('gather', data, event);

		// Get value if element is <input/> or <select/>.
		if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName()) >= 0) {
			if (target.attr('type') === 'checkbox') {
				if (!target.prop('checked')) return data;
			}
			var value = target.val();
			addGatheredData(data, name, value);
			return data;
		}
	}

	if (typeof propName !== 'string') propName = name;

	// Process inclusion.
	if (target.hasInclusion()) {
		var tmp = {};
		gatherInstanceData(target.inclusion(), tmp, null, curData, propName);
		if (Object.keys(tmp).length > 0 && !data.hasOwnProperty(propName)) {
			if (name !== null) {
				data[name] = tmp;
			} else {
				for (var p in tmp) {
					data[p] = tmp[p];
				}
			}
		}

		// Gather child instances.
	} else if (target.hasChildUI()) {
		var res = [];
		if (name !== null || propName !== null) {
			children = target.children();
			for (var i = 0; i < children.length; i++) {
				var tmp = {};
				gatherInstanceData(children[i], tmp, null, curData, propName);
				if (Object.keys(tmp).length > 0) res.push(tmp);
			}
			if (name !== null) {
				data[name] = res;
			} else if (propName !== null) {
				curData !== null ? curData[propName] = res : data[propName] = res;
			}
		}


		// Gather child instances.
	} else if (target.children().length > 0) {
		children = target.children();
		for (var i = 0; i < children.length; i++) {
			if (children[i] instanceof UIInstance) {
                var root = children[i].getRootElement();
                if(root.hasAttr('name')){
                    name = root.attr('name');
                }
				var tmp = {};
				gatherInstanceData(children[i], tmp, null, curData, propName);
				if (name !== null) {
					data[name] = tmp;
				} else {
					for (var p in tmp) {
						data[p] = tmp[p];
					}
				}
			}
		}

		// Loop through native child nodes if target is an element on which gatherData() was called.
	} else if (gatherChildNodes === true) {
		var childNodes = target.__.node.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			if (childNodes[i] === undefined || childNodes[i].uielement === undefined) continue;
			var tmp = {};
			gatherElementData(childNodes[i].uielement, tmp, curData, propName, true);
			for (var p in tmp) {
				data[p] = tmp[p];
			}
		}
	}
}


/**
 *
 * @param instance
 * @param result
 * @param scheme
 * @param curData
 * @param propName
 */
function gatherInstanceData(instance, result, scheme, curData, propName) {
	if (scheme === undefined || scheme === null) scheme = instance.__.ui.scheme;
	if (result === undefined) result = {};
	var v, keys, res;
	for (var p in scheme) {
		if (!instance.hasOwnProperty(p)) continue;

		res = gatherElementData(instance[p], v = {}, curData, propName);

		var s = scheme[p];
		keys = Object.keys(v);
		if (keys.length > 0) {
			addGatheredData(result, keys[0], v[keys[0]]);
		}
		v = typeof v[keys[0]] === 'object' ? v = v[keys[0]] : v = result;

		if (typeof s === 'object') {
			gatherInstanceData(instance, v, s, curData, propName);
		}
	}
}


/**
 *
 * @param result
 * @param name
 * @param value
 */
function addGatheredData(result, name, value) {
	if (Array.isArray(result)) {
		result.push(value);
	} else {
		if (result.hasOwnProperty(name)) {
			if (!Array.isArray(result[name])) result[name] = [result[name]];
			result[name].push(value);
		} else {
			result[name] = value;
		}
	}
}


/**
 * Compacts data to simplify structure.
 * The main purpose is convert arrays of objects with one property to array with their values.
 * For example it converts [{id : 3}, {id : 5}, {id : 7}] to [3, 5, 7]
 */
function compactData(data) {
	for (var p in data) {
		if (Array.isArray(data[p])) {
			var arr = [];
			var propName = null;
			for (var i = 0; i < data[p].length; i++) {
				if (typeof data[p][i] === 'object') {
					var keys = Object.keys(data[p][i]);
					if (keys.length === 1) {
						// Stop converting if properties of objects don't match.
						if (propName !== null && propName !== keys[0]) {
							return;
						}
						arr.push(data[p][i][keys[0]]);
					} else {
						return;
					}
				} else {
					return;
				}
			}
			data[p] = arr;
		} else if (typeof data[p] === 'object') {
			compactData(data[p]);
		}
	}
}


function cloneObjectTo(src, dst){
    for(var p in src){
        if(src.hasOwnProperty(p)){
            if(Array.isArray(src[p])){
                dst[p] = src[p].slice(0);
            }else if(typeof src[p] === 'object'){
                dst[p] = {};
                cloneObjectTo(src[p], dst[p]);
            }else{
                dst[p] = src[p];
            }
        }
    }
}

/**
 * Clones UIElement.
 * @returns {UIElement}
 */
UIElement.prototype.clone = function()
{
      var newEl = new UIElement({});
      cloneObjectTo(this, newEl);
      cloneObjectTo(this.__, newEl.__);
      var oldNode = this.node();
      var newNode = oldNode.cloneNode(true);
      newNode.uielement = newEl;
      newEl.__.node = newNode;
      return newEl;
};
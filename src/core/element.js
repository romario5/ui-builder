import uiRegistry from '../registries/ui-registry';
import extensionsManager from './extension';
import {error, warn} from '../utils/logging';
import {cloneObjectTo} from '../utils/object-utils';
import Animation from './animation';
import Data from './data';

/**
 * Element class represents simple DOM node.
 * It's actually wrapper of the node.
 * Elements provide few useful methods like [css()}, [val()] and so on.
 */
export default class Element
{
    constructor(params){
        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        // Set parameters
        this.__.name = params.name !== undefined ? params.name : null;
        this.__.child = params.child !== undefined ? params.child : null;
        this.__.childParams = params.parameters || {};
        this.__.class = params.class !== undefined ? params.class : null;
        this.__.id = params.id !== undefined ? params.id : null;
        this.__.tag = params.tag !== null && params.tag !== undefined ? params.tag.toLowerCase() : 'div';
        this.__.inclusion = null;

        // Create node.
        if (this.__.tag === '') this.__.tag = 'div';
        this.__.node = document.createElement(this.__.tag);
        this.__.parent = null;
        this.__.uiinstance = null;
        this.__.instance = null;

        this.__.node.instance = null;

        // Deprecated property.
        // Please use [instance] property.
        this.__.node.uiinstance = null;


        this.__.node.element = this;

        // Deprecated property.
        // Please use [element] property.
        this.__.node.uielement = this;

        /**
         * Holds extensions that applied to the element.
         * @type {{ExtensionInstance}}
         */
        this.__.extensions = {};

        // Deprecated properties.
        // Please use [extensions] property to store extensions data.
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

        // Attach attributes.
        for (let p in params.attributes) {
            if(params.attributes.hasOwnProperty(p)){
                this.__.node.setAttribute(p, params.attributes[p]);
            }
        }

        // Set properties.
        for (let p in params.properties) {
            if(params.properties.hasOwnProperty(p)){
                // Use prototype method if available.
                if (Element.prototype.hasOwnProperty(p) && typeof Element.prototype[p] === 'function') {
                    Element.prototype[p].call(this, params.properties[p]);

                    // Otherwise set node properties directly.
                } else {
                    this.__.node[p] = params.properties[p];
                }
            }
        }

        // Set class and id.
        if (typeof this.__.class === 'string') this.__.node.className = this.__.class;
        if (typeof this.__.id === 'string') this.__.node.id = this.__.id;
    }
}

/**
 * Applies extension to the element.
 * Returns true if applying was successful.
 * @returns {boolean}
 */
Element.prototype.applyExtension = function (name, params) {
    // Log warning if extension is already applied to the element.
    if(this.__.extensions.hasOwnProperty(name)){
        warn('Extension with name "' + name + '" is already applied to the element.');
        return false;
    }

    // Log error if requested extension is absent.
    let ext = extensionsManager(name);
    if(ext === null){
        error('Extension with name "' + name + '" is not registered yet.');
        return false;
    }

    this.__.extensions[name] = ext.applyTo(this, params);
    return true;
};

/**
 * Returns extension by name.
 * @param name {string}
 * @return {ExtensionInstance|null}
 */
Element.prototype.extension = function (name) {
    if(this.__.extensions.hasOwnProperty(name)){
        return this.__.extensions[name];
    }
    return null;
};

/**
 * Removes extension from the element.
 * Returns true if removing was successful.
 * @param name {string}
 * @returns {boolean}
 */
Element.prototype.removeExtension = function (name) {
    // Return false if extension with given name was not applied yet.
    if(!this.__.extensions.hasOwnProperty(name)){
        return false;
    }

    let ext = this.__.extensions[name];
    if (ext.remove !== undefined) {
        ext.remove();
        delete this.__.extensions[name];
        return true;
    }

    return false;
};

/**
 * Tries to update extension with given name by passing new parameters.
 * To make update possible extension must implement 'update' event handler.
 * @param name {string} Name of the extension.
 * @param params {object} Parameters to be updated.
 * @return {boolean}
 */
Element.prototype.updateExtension = function (name, params) {
    // Return false if extension with given name was not applied yet.
    if(!this.__.extensions.hasOwnProperty(name)){
        return false;
    }
    if (ext.update !== undefined) {
        ext.update(params);
        return true;
    }
    return false;
};

/**
 * Applies localization to the element.
 * The localization category is stored in the "localization" attribute
 * and the translation is stored in the "T" property of the element node.
 * @param localization
 * @param translation
 * @returns {Element}
 */
Element.prototype.applyLocalization = function (localization, translation) {
    this.__.node.setAttribute('localization', localization);
    this.__.node.T = translation;
    return this;
};

/**
 * Checks if element has child UI.
 * @returns {boolean}
 */
Element.prototype.hasChildUI = function () {
    return this.__.child !== null;
};

/**
 * Returns node of the element.
 * Note that node can be not appended to another one.
 * @returns {Node}
 */
Element.prototype.node = function(){
    return this.__.node;
};

/**
 * Getter/setter of the node's [scrollTop] property.
 * @param value
 * @returns {Element}
 */
Element.prototype.scrollTop = function(value){
    if(value === undefined){
        return this.__.node.scrollTop;
    }
    this.__.node.scrollTop = value;
    return this;
};

/**
 * Getter/setter of the node's [ScrollHeight] property.
 * @returns {number}
 */
Element.prototype.scrollHeight = function(){
    return this.__.node.scrollHeight;
};

/**
 * Sets child UI.
 * @param {string|UI} ui
 * @returns {Element}
 */
Element.prototype.setChildUI = function (ui) {
    if (typeof ui === 'string') {
        this.__.child = ui;
    } else if (ui.render !== undefined) {
        this.__.child = ui.name;
    }
    return this;
};

/**
 * Returns child UI.
 * @returns {UI|null}
 */
Element.prototype.getChildUI = function () {
    return uiRegistry.get(this.__.child);
};

/**
 * Checks if element includes another ui instance.
 * @returns {boolean}
 */
Element.prototype.hasInclusion = function () {
    return this.__.inclusion !== null
        && this.__.children.length === 1
        && this.__.children[0].__ !== undefined;
};

/**
 * Finds parent element (Element) inside own Instance.
 * If element has no local parent null will be returned.
 * @returns {Element|null}
 */
Element.prototype.findTopLocalParent = function () {
    let p = this;
    while (p instanceof Element) {
        if (p.__.parent === null) break;
        if (p.__.parent instanceof Element && p.__.parent.__.instance === this.__.instance) {
            p = p.__.parent;
        } else {
            break;
        }
    }
    if (p === this) return null;
    return p;
};

/**
 * Returns element inclusion.
 * @returns {Element.inclusion|*|null}
 */
Element.prototype.inclusion = function () {
    return this.__.inclusion;
};

/**
 * Returns instance in which element is rendered.
 * @returns {Element.instance|*|null}
 */
Element.prototype.instance = function () {
    return this.__.instance;
};

/**
 * Deprecated method.
 * Use [instance()] method instead.
 * @returns {Instance}
 * @deprecated
 * @see Element.instance
 */
Element.prototype.UII = function () {
    return this.__.instance;
};

/**
 * Returns prent element.
 * @returns {Element|null}
 */
Element.prototype.parent = function () {
    return this.__.parent;
};

/**
 * Deprecated method.
 * Use [parentInstance()] method instead.
 * @returns {Instance|null}
 * @deprecated
 * @see Element.parentInstance
 */
Element.prototype.parentUII = function () {
    return this.instance() === null ? null : this.UII().parentUII();
};

/**
 * Returns parent instance.
 * @returns {*}
 */
Element.prototype.parentInstance = function () {
    return this.instance() === null ? null : this.UII().parentUII();
};

/**
 * Returns all children of the element.
 * Children are all the instances that rendered inside the element using child UI.
 * @returns {array}
 */
Element.prototype.children = function () {
    return this.__.children;
};

/**
 * Returns all child elements even if they are not instances of the child UI.
 * @returns {Element[]}
 */
Element.prototype.getAllChildElements = function()
{
    let c = this.__.node.childNodes;
    let res = [];
    for(let i = 0, len = c.length; i < len; i++){
        if(c[i].uielement instanceof Element) res.push(c[i].uielement);
    }
    return res;
};

/**
 * Returns all nearby elements (siblings) even if they are not instances of the child UI.
 * @returns {Element[]}
 */
Element.prototype.getAllNearbyElements = function()
{
    let c = this.__.node.parentNode.childNodes;
    let res = [];
    for(let i = 0, len = c.length; i < len; i++){
        if(c[i].element instanceof Element && c[i].element !== this) res.push(c[i].element);
    }
    return res;
};

/**
 * List of events that will be attached directly to the node.
 * @type {string[]}
 */
let nativeEvents = ['submit', 'abort', 'beforeinput', 'blur', 'click', 'compositionen', 'paste',
    'compositionstart', 'compositionupdate', 'dblclick', 'error', 'focus', 'change',
    'focusin', 'focusout', 'input', 'keydown', 'keypress', 'keyup', 'load',
    'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mousewheel',
    'mouseup', 'resize', 'scroll', 'select', 'unload', 'wheel', 'touchstart', 'touchend', 'touchmove'
];


/**
 * Implements specific events system.
 * Elements need to handle native JS events so
 * do NOT use [addEventsImplementation] for Element!
 * Note that element's events system doesn't supports ports.
 * @param {string} eventName
 * @param {function} handler
 */
Element.prototype.addEventListener = function (eventName, handler) {
    eventName = eventName.toLowerCase();
    if(typeof handler !== 'function'){
        error('Invalid callback type given for the event "'+ eventName + '".');
        return;
    }
    if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
    if (!this.__.events.hasOwnProperty(eventName)) this.__.events[eventName] = [];

    // Exit if handler is already added.
    if (this.__.events[eventName].indexOf(handler) >= 0) {
        warn('Handler for the event "' + eventName + '" already added.');
        return this;
    }

    this.__.events[eventName].push(handler);

    if (nativeEvents.indexOf(eventName) >= 0) {
        this.__.node.addEventListener(eventName, runElementHandlers);
    }

    return this;
};

// Add some syntax sugar.
Element.prototype.on = Element.prototype.addEventListener;

/**
 * Removes events listener.
 * @param eventName
 * @param {function} handler
 * @returns {Element}
 */
Element.prototype.removeEventListener = function (eventName, handler) {
    eventName = eventName.toLowerCase();
    if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
    if (!this.__.events.hasOwnProperty(eventName)) return this;

    let index = this.__.events[eventName].indexOf(handler);
    if (index < 0) return this;
    this.__.events[eventName].splice(index, 1);
    return this;
};

/**
 * Removes all handlers for the given event.
 * @param {string} eventName
 * @returns {Element}
 */
Element.prototype.removeAllEventListeners = function (eventName) {
    if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
    if (!this.__.events.hasOwnProperty(eventName)) return this;
    this.__.events[eventName] = null;
    delete this.__.events[eventName];
    this.__.node.removeEventListener(eventName, runElementHandlers);
    return this;
};

/**
 * Removes given handler (or all handlers if omitted) of the given event.
 * @param {string} eventName
 * @param {function} [handler]
 * @returns {Element}
 */
Element.prototype.off = function (eventName, handler) {
    eventName = eventName.toLowerCase();
    if (handler !== undefined) {
        this.removeEventListener(eventName, handler);
    } else {
        this.removeAllEventListeners(eventName);
    }
    return this;
};

/**
 * Triggers event with given name.
 * @param {string} eventName
 * @param {*} [data]
 * @returns {Element}
 */
Element.prototype.triggerEvent = function (eventName, data) {
    eventName = eventName.toLowerCase();
    let args = [], i;
    for (i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
    if (!this.__.events.hasOwnProperty(eventName)) return this;

    let handlers = this.__.events[eventName];
    for (i = 0; i < handlers.length; i++) {
        handlers[i].apply(this, args);
    }
};

function runElementHandlers(e) {
    let handlers = this.uielement.__.events[e.type];
    for (let i = 0; i < handlers.length; i++) {
        handlers[i].call(this.uielement, this.uiinstance, e);
    }
}


/**
 * Removes all children.
 * @returns {Element}
 */
Element.prototype.removeChildren = function () {
    for (let i = 0, len = this.__.children.length; i < len; i++) {
        this.__.children[0].remove();
    }
    this.__.children = [];
    return this;
};


/**
 * Removes element from the parent and from the instance.
 */
Element.prototype.remove = function () {
    if (this.__.node.parentNode === null) return;
    this.__.node.parentNode.removeChild(this.__.node);
    delete this.__.node.uiinstance[this.__.name];
};


/**
 * Adds one instance of child UI to the element.
 * @param {boolean} [atStart] If true, builds UI at the start of the list
 * @param {object} [params] Parameters of the newly created UI.
 * @returns {Instance} - New instance of the UI, that was appended to the Element.node
 */
Element.prototype.addOne = function (atStart, params) {
    if (typeof params !== 'object') {
        params = typeof atStart === 'object' ? atStart : this.__.childParams;
    }
    atStart = typeof atStart === 'boolean' ? atStart : false;
    if (this.__.child === null) return null;
    let ui = uiRegistry.get(this.__.child);
    if (ui === null) return null;
    return this.add(ui, atStart, params);
};

/**
 *
 * @param target
 * @param params
 * @return {*}
 */
Element.prototype.addOneAfter = function (target, params) {
    if (typeof params !== 'object') {
        params = {};
    }
    if(target.isImplementationOf === undefined){
        return error('Invalid parameter given for the element method "addOneAfter()" - instance is required but ' + (typeof target) + ' given.');
    }
    if (this.__.child === null) return null;
    let ui = uiRegistry.get(this.__.child);
    if (ui === null) return null;
    return this.addAfter(ui, target, params);
};

/**
 *
 * @param target
 * @param params
 * @return {*}
 */
Element.prototype.addOneBefore = function (target, params) {
    if (typeof params !== 'object') {
        params = {};
    }
    if(target.isImplementationOf === undefined){
        return error('Invalid parameter given for the element method "addOneBefore()" - instance is required but ' + (typeof target) + ' given.');
    }
    if (this.__.child === null) return null;
    let ui = uiRegistry.get(this.__.child);
    if (ui === null) return null;
    return this.addBefore(ui, target, params);
};


/**
 * Renders UI inside element (itself).
 * @param {UI|string} ui
 * @param {boolean} [atStart] if true new elements will be added at start. Default is false.
 * @param {object} [params]
 * @returns {Instance}
 */
Element.prototype.add = function (ui, atStart, params) {
    if (atStart === undefined || atStart === null) atStart = false;

    if (typeof ui === 'string') {
        ui = uiRegistry.get(ui);
        if (ui === null) {
            error('UI with name ' + ui + ' is absent.');
        }
    }

    if (ui.renderTo === undefined) {
        error('First argument of the add() method must be UI or string');
    }
    let instance = ui.renderTo(this, atStart, params);

    this.triggerEvent('add', instance);

    instance.__.parent = this;
    return instance;
};


Element.prototype.addAfter = function (ui, item, params) {
    if (item.isImplementationOf === undefined){
        error('First argument for the method "addAfter()" is not instance.');
        return null;
    }

    if (typeof ui === 'string') {
        ui = _uibuilder(ui);
        if (ui === null) {
            throw new InvalidParamException('UI with name ' + ui + ' is absent.');
        }
    }

    if (ui.prepare === undefined) {
        throw new InvalidParamException('First argument of the addAfter() method must be UI or string');
    }
    let instance = ui.prepare(params);

    // EXPERIMENTAL
    // Next event may be removed in the future so don't use it.
    // Exit if user prevents adding.
    let event = new Event('beforeAdd', {cancelable: true});
    this.triggerEvent('beforeAdd', instance, event);
    if (event.defaultPrevented) return null;

    let lastElement = item.getLastRootElement();
    instance.appendAfter(lastElement);
    instance.__.parent = this;

    // Put instance into the children array.
    let parent = lastElement.parent();
    if(parent.hasChildUI()){
        let children = parent.__.children;
        if(children.length <= 1){
            parent.__.children.push(instance);
        }else{
            for(let i = 0; i < children.length; i++){
                if(children[i] === item){
                    parent.__.children.splice(i, 0, instance);
                    break;
                }
            }
        }
    }

    instance.triggerEvent('render', params);
    ui.triggerEvent('render', instance, params);
    this.triggerEvent('add', instance);

    return instance;
};


Element.prototype.addBefore = function (ui, item, params) {
    if (item.isImplementationOf === undefined){
        error('First argument for the method "addAfter()" is not instance.');
        return null;
    }

    if (typeof ui === 'string') {
        ui = _uibuilder(ui);
        if (ui === null) {
            throw new InvalidParamException('UI with name ' + ui + ' is absent.');
        }
    }

    if (ui.prepare === undefined) {
        throw new InvalidParamException('First argument of the addAfter() method must be UI or string');
    }

    let instance = ui.prepare(params);

    // EXPERIMENTAL
    // Next event may be removed in the future so don't use it.
    // Exit if user prevents adding.
    let event = new Event('beforeAdd', {cancelable: true});
    this.triggerEvent('beforeAdd', instance, event);
    if (event.defaultPrevented) return null;


    let firstElement = item.getFirstRootElement();
    instance.appendBefore(firstElement);
    instance.__.parent = this;

    // Put instance into the children array.
    let parent = firstElement.parent();
    if(parent.hasChildUI()){
        let children = parent.__.children;
        if(children.length <= 1){
            parent.__.children.unshift(instance);
        }else{
            for(let i = 0; i < children.length; i++){
                if(children[i] === item){
                    if(i === 0){
                        parent.__.children.unshift(instance);
                    }else{
                        parent.__.children.splice(i - 1, 0, instance);
                    }
                    break;
                }
            }
        }
    }

    instance.triggerEvent('render', params);
    ui.triggerEvent('render', instance, params);
    this.triggerEvent('add', instance);

    return instance;
};

/**
 * Functions to manage properties like in jQuery but working
 * with Element instances.
 * @returns {Element}
 */
Element.prototype.html = function (html) {
    if (html === undefined) return this.__.node.innerHTML;
    this.__.node.innerHTML = html;
    return this;
};

/**
 * Gets/sets text content of te node.
 * @param {string} [text]
 * @returns {Element}
 */
Element.prototype.text = function (text) {
    if (text === undefined) return this.__.node.textContent;
    this.__.node.textContent = text;
    return this;
};

/**
 * Sets new or returns existing value of the attribute.
 * @param {string} name
 * @param {*} [value]
 * @returns {Element|*}
 * @see Element.src
 * @see Element.href
 */
Element.prototype.attr = function (name, value) {
    if (value === undefined) {
        // Ensure to return correct value (empty string by DOM specification) if attribute is not defined.
        if (!this.__.node.hasAttribute(name)) return '';
        return this.__.node.getAttribute(name);
    }
    this.__.node.setAttribute(name, value);
    return this;
};

/**
 * Returns true if attribute with given name is set.
 * @param {string} name
 * @returns {boolean}
 */
Element.prototype.hasAttr = function (name) {
    return this.__.node.hasAttribute(name);
};

/**
 * Removes attribute with given name.
 * @param {string} name
 * @returns {boolean}
 */
Element.prototype.removeAttr = function (name) {
    return this.__.node.removeAttribute(name);
};

/**
 * Gets/sets value of the given property of the node.
 * @param {string} name
 * @param {*} [value]
 * @returns {*}
 */
Element.prototype.prop = function (name, value) {
    if (value === undefined) return this.__.node[name];
    this.__.node[name] = value;
    return this;
};

/**
 * Gets/sets value of the node (usable only for <input> tags).
 * @param {*} [val]
 * @returns {Element|*}
 */
Element.prototype.val = function (val) {
    if (val === undefined) return this.__.node.value;
    this.__.node.value = val;
    return this;
};

/**
 * Gets/sets "src" property of the image.
 * @param {string} [val]
 * @returns {Element|*}
 */
Element.prototype.src = function (val) {
    if(this.__.node.tagName !== 'IMG'){
        warn('Calling [src()] method not on the image tag.');
    }
    if (val === undefined) return this.__.node.src;
    this.__.node.src = val;
    return this;
};

/**
 * Gets/sets "href" property of the node.
 * @param {string} [val]
 * @returns {Element|*}
 */
Element.prototype.href = function (val) {
    if (val === undefined) return this.__.node.href;
    this.__.node.href = val;
    return this;
};

/**
 * Returns context of the canvas.
 * @param {string} [val]
 * @returns {CanvasRenderingContext2D|*}
 */
Element.prototype.getContext = function (val) {
    if (val === undefined) return this.__.node.getContext('2d');
    return this.__.node.getContext(val);
};

/**
 * Gets/sets width property of the node.
 * Usable only for image, video, canvas, etc.
 * @param {number} [val]
 * @returns {Element}
 * @see Element.height
 */
Element.prototype.width = function (val) {
    if (val === undefined) return this.__.node.width;
    this.__.node.width = val;
    return this;
};

/**
 * Gets/sets height property of the node.
 * Usable only for image, video, canvas, etc.
 * @param {number} [val]
 * @returns {Element}
 * @see Element.width
 */
Element.prototype.height = function (val) {
    if (val === undefined) return this.__.node.height;
    this.__.node.height = val;
    return this;
};

/**
 * Returns outer width of the node in pixels (alias of the offsetWidth property).
 * @returns {number}
 */
Element.prototype.outerWidth = function () {
    return this.__.node.offsetWidth;
};

/**
 * Returns outer height of the node in pixels (alias of the offsetHeight property).
 * @returns {number}
 */
Element.prototype.outerHeight = function () {
    return this.__.node.offsetHeight;
};

/**
 * Immediately hides element by setting "display" style property to "none".
 * Also stores previous value of the "display" style property.
 * @returns {Element}
 * @see Element.show
 * @see Element.css
 */
Element.prototype.hide = function() {
    if (this.__.node.style.display === 'none') return this;
    this.__.node.oldDisplay = this.__.node.style.display;
    this.__.node.style.display = 'none';
    return this;
};

/**
 *
 * @returns {Element}
 * @see Element.hide
 * @see Element.css
 */
Element.prototype.show = function (showAs) {
    if(typeof showAs === 'string'){
        this.__.node.style.display = showAs;
        return this;
    }
    if (this.__.node.style.display !== 'none' && this.__.node.offsetParent !== null) return this;
    if (this.__.node.hasOwnProperty('oldDisplay') && this.__.node.oldDisplay !== 'none') {
        this.__.node.style.display = this.__.node.oldDisplay;
    } else {
        this.__.node.style.display = 'flex';
    }
    return this;
};

/**
 * Returns true if element is hidden.
 * @returns {boolean}
 */
Element.prototype.isHidden = function () {
    let style = this.computedStyle();
    return style.display === 'none';
};

/**
 * Returns true if element is shown.
 * @returns {boolean}
 */
Element.prototype.isVisible = function () {
    let style = this.computedStyle();
    return style.display !== 'none' && style.visibility !== 'hidden';
};

/**
 * Returns content height of the element.
 * @returns {number}
 */
Element.prototype.contentHeight = function () {
    let node = this.__.node;
    // Store initial height styles.
    let h = node.style.cssText.match(/height\s*:\s*[\d\w%]+/i);
    h = h === null ? '' : h[0];
    // Set height to auto and store inner height.
    node.style.height = 'auto';
    let height = parseInt(window.getComputedStyle(node).getPropertyValue('height').replace(/[^.\d]/i, ''));
    // Restore height style.
    node.style.cssText = node.style.cssText.replace(/height\s*:\s*auto/i, h);
    return height;
};

/**
 * Slides down element with specified duration.
 * @param {number} [duration] Animation duration in milliseconds (default is 250).
 * @param {function} [callback] Function that will be called when animation will be finished.
 * @returns {Element}
 */
Element.prototype.slideDown = function (duration, callback) {
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
 * @param {number} [duration] Animation duration in milliseconds (default is 250).
 * @param {function} [callback] Function that will be called when animation will be finished.
 * @returns {Element}
 */
Element.prototype.slideUp = function (duration, callback) {
    if (this.outerHeight() === 0 || this.isHidden()) return this;
    if (typeof duration !== 'number') duration = 250;
    this.animate({height: 0}, duration, callback);
    this.__.fx = 'slideUp';
    return this;
};

/**
 * Slides up element with specified duration.
 * @param {number} [duration] Animation duration in milliseconds (default is 250).
 * @param {function} [callback] Function that will be called when animation will be finished.
 * @returns {Element}
 */
Element.prototype.slideToggle = function (duration, callback) {
    if (typeof duration !== 'number') duration = 250;
    if (this.node().clientHeight === 0 || this.isHidden() || this.__.fx === 'slideUp') {
        this.slideDown(duration, callback);
    } else {
        this.slideUp(duration, callback);
    }
    return this;
};

/**
 * Returns true if element has given class.
 * @param {string} className
 * @returns {boolean}
 */
Element.prototype.hasClass = function (className) {
    return this.__.node.classList.contains(className);
};

/**
 * Returns true if element has all given classes.
 * If at least one class is absent - false will be returned.
 * @param {string[]} classNames
 * @returns {boolean}
 */
Element.prototype.hasClasses = function (classNames) {
    for(let i = 0; i < classNames.length; i++){
        if(!this.__.node.classList.contains(classNames[i])){
            return false;
        }
    }
    return true;
};

/**
 * Adds class(es) to the element.
 * @param {string|Array} className
 * @returns {Element}
 */
Element.prototype.addClass = function (className) {
    if (typeof className === 'string') {
        this.__.node.classList.add(className);
    } else if (Array.isArray(className)) {
        for (let i = 0; i < className.length; i++) {
            this.__.node.classList.add(className[i]);
        }
    } else {
        return this;
    }
    this.__.class = this.__.node.className;
    return this;
};

/**
 * Removes given class(es) from the element.
 * @param {string|Array} className
 * @returns {Element}
 */
Element.prototype.removeClass = function (className) {
    if (typeof className === 'string') {
        this.__.node.classList.remove(className);
    } else if (Array.isArray(className)) {
        for (let i = 0; i < className.length; i++) {
            this.__.node.classList.remove(className[i]);
        }
    } else {
        return this;
    }
    this.__.class = this.__.node.className;
    return this;
};

/**
 * If element has given class - it will be removed.
 * Otherwise class will be added.
 * @param {string} className
 * @returns {Element}
 */
Element.prototype.toggleClass = function (className) {
    this.__.node.classList.toggle(className);
    this.__.class = this.__.node.className;
    return this;
};

/**
 * If object given - sets given styles and returns element.
 * If string given - returns value of the given style property.
 * @param style
 * @returns {Element|*}
 */
Element.prototype.css = function (style) {
    if (typeof style === 'string') {
        let s = this.computedStyle();
        let val = s.hasOwnProperty(style) ? s[style] : null;
        if (val !== null && val.indexOf('px') >= 0) val = parseFloat(val.replace('px', ''));
        return val;
    } else if (typeof style === 'object') {
        for (let p in style) {
            if(style.hasOwnProperty(p)) this.__.node.style[p] = style[p];
        }
    }
    return this;
};

/**
 * Alias of the [getBoundingClientRect()] node method.
 * @returns {ClientRect}
 * @see https://developer.mozilla.org/ru/docs/Web/API/Element/getBoundingClientRect
 */
Element.prototype.clientRect = function () {
    return this.__.node.getBoundingClientRect();
};

/**
 * Returns tag name of the node.
 * Alias of the [tagName] property.
 * @returns {string}
 */
Element.prototype.tagName = function () {
    return this.__.node.tagName;
};

/**
 * Returns computed style of the element node.
 * Alias of the [getComputedStyle()] method.
 * @returns {CSSStyleDeclaration}
 */
Element.prototype.computedStyle = function () {
    return getComputedStyle(this.__.node);
};


/**
 * Smoothly shows element by changing opacity over the time.
 * @param {number} [duration] Fading duration in milliseconds.
 * @param {string|number} [displayAs] If set will be used to set display
 * css property before animation start.
 * @param {function|number} [callback]
 * @returns {Element}
 * @see Element.fadeToggle
 * @see Element.fadeOut
 */
Element.prototype.fadeIn = function (duration, displayAs, callback) {
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
 * @param {int|function} [duration] Fading duration in milliseconds.
 * @param {boolean|function} [hideOnEnd] If true the css display property will be set to 'none'
 * on animation finish.
 * @param {function} [callback]
 * @returns {Element} (itself)
 * @see Element.fadeIn
 * @see Element.fadeToggle
 */
Element.prototype.fadeOut = function (duration, hideOnEnd, callback) {
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

    let el = this;

    if (hideOnEnd) {
        setTimeout(function () {
            el.css({display: 'none'});
        }, duration);
    }
    return this;
};


/**
 * Toggles fading effect.
 * @param {number} [duration] Fading duration in milliseconds.
 * @param {string} [displayAs] If set will be used to set display
 * CSS property before animation start in case of fadeIn() method will be applied.
 * If fadeOut() method and displayAs property is specified - element will be hidden after
 * animation finish.
 * @param {function} [callback]
 * @returns {Element}
 * @see Element.fadeIn
 * @see Element.fadeOut
 */
Element.prototype.fadeToggle = function (duration, displayAs, callback) {
    if (this.isHidden() || this.css('opacity') === 0 || this.__.fx === 'fadeOut') {
        this.fadeIn(duration, displayAs, callback);
    } else {
        this.fadeOut(duration, displayAs === true, callback);
    }
    return this;
};


/**
 * Animates CSS properties of the object.
 * @param {object} props Object with animated properties.
 * Keys are properties names and values are the end values.
 * @param {number} [duration] Duration in milliseconds.
 * @param {function} [callback] Function that will be called when animation will be finished.
 * @returns {Element}
 * @see Animation
 */
Element.prototype.animate = function (props, duration, callback) {
    let el = this;
    let startValues = {};
    let endValues = props;
    let units = {};

    // Get initial values.
    let styles = this.computedStyle();
    for (let p in endValues) {

        units[p] = styles[p].replace(/[-\d.]/g, '');
        startValues[p] = parseFloat(styles[p].toString().replace(/[^-\d.]/gi, ''));
        if((p === 'width' || p === 'maxWidth' || p === 'minWidth') && (endValues[p] + "").indexOf('%') > 0){
            units[p] = '%';
            startValues[p] = startValues[p] / this.__.node.parentNode.offsetWidth * 100;
        }else if((p === 'height' || p === 'maxHeight' || p === 'minHeight') && (endValues[p] + "").indexOf('%') > 0){
            units[p] = '%';
            startValues[p] = startValues[p] / this.__.node.parentNode.offsetHeight * 100;
        }
        endValues[p] = parseFloat(endValues[p].toString().replace(/[^-\d.]/gi, ''));
    }

    this.stopAnimation();

    // Create new animation.
    let ani = new Animation({
        duration: duration,
        f: 'easeInOutQuad'
    });

    this.__.animation = ani;


    // Run animation.
    this.__.animation.run(function (k, isEnd) {
        if (el.__.animation !== ani || el.__.animation.stopped) return;
        let diff, cssObj = {};
        for (let p in endValues) {
            let k2 = k;
            diff = endValues[p] - startValues[p];


            if (diff === 0) continue;
            cssObj[p] = parseFloat((diff * k2).toFixed(5)) + startValues[p] + units[p];
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
 * Stops current animation and set "animation" property to null.
 * @returns {Element}
 */
Element.prototype.stopAnimation = function () {
    if (this.__.animation !== null) this.__.animation.stop();
    this.__.animation = null;
    this.__.fx = null;
    return this;
};


/**
 * Loads data into element.
 * @param data Data to be loaded into the element and/or children.
 * If [[data]] is object - all nested elements will be loaded with nested data.
 * String will be used as innerHTML.
 * Array produces child instances if child UI is specified for the element.
 * @param {boolean} [replace] If true - existing content of the element will be deleted before loading.
 * @param {boolean} [atStart] If new content will be inserted at the start of the element. Default is false.
 * This argument will be ignored if [[replace]] is true.
 * @returns {Element}
 */
Element.prototype.load = function (data, replace, atStart) {
    // Set default values.
    if (typeof replace !== 'boolean') replace = true;
    if (typeof atStart !== 'boolean') atStart = false;

    // If Data (data provider) is given through "data" argument
    // use fetch() method and then load given data using load() method.
    if (data instanceof Data) {

        return data.fetch(function (replace, atStart, response) {
            this.load(response, replace, atStart);
        }.bind(this, replace, atStart));

    } else {

        let deleteContent = true;

        if (this.inclusion() === null) {
            if (typeof data === 'object' && !Array.isArray(data)) {
                deleteContent = false;
                for (let p in data) {
                    if (data.hasOwnProperty(p) && !Element.prototype.hasOwnProperty(p) && uiRegistry.get(p) !== null) {
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
    let event = new Event('load', {cancelable: true});
    this.triggerEvent('load', data, event);

    // Stop loading if event was cancelled by preventDefault() method.
    if (event.defaultPrevented) return this;

    // If data is string - use is as innerHTML (for <img/> "src" attribute will be used).
    if (typeof data === 'string' || typeof data === 'number') {

        let tagName = this.tagName();

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
                warn('Trying to load children for Element "' + this.__.name + ' @ ' + this.__.uiinstance.__.ui.name + '" without child UI.');
                return this;
            }

            let child;
            for (let i = 0; i < data.length; i++) {
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

            for (let p in data) {
                if(!data.hasOwnProperty(p)) continue;

                // Load children ...
                if (p === 'children' && Array.isArray(data[p]) && this.hasChildUI()) {
                    this.load(data[p], replace, atStart);

                    // ... or execute prototype method ...
                } else if (Element.prototype.hasOwnProperty(p) && typeof Element.prototype[p] === 'function') {
                    Element.prototype[p].call(this, data[p]);

                    // ... otherwise render new UI.
                } else {
                    if (this.hasOwnProperty(p) && this[p] instanceof Element) {
                        if (this[p].inclusion() !== null) {
                            this[p].inclusion().load(data[p]);
                        }else{
                            this[p].load(data[p]);
                        }
                    }else{
                        let ui = uiRegistry.get(p);
                        if (ui !== null) {
                            ui.renderTo(this).load(data[p], replace, atStart);
                        }
                    }
                }
            }

        }

    } else {
        warn('Trying to load unsupported data type (' + typeof data + ') to tye element. Only string or object can be used.');
    }

    this.triggerEvent('afterLoad', data);
    return this;
};


/**
 * Resets values of the inputs/selects inside the Element.
 * @param {boolean} [compact]
 * @returns {{}}
 */
Element.prototype.resetValues = function (compact) {
    // TODO Implement this method...
};




/**
 * Creates holder for the value.
 * Can be used as simple object for storing property or 
 * as a callback:
 *
 * onGather(inst, data, event) {
	   data.someProperty = 'Hello world!';
 * 	   data.value('Hello world!');
 * } 
 */
function createValueHolder() {
	let _value = undefined;
	function ValueHolder(value) {

    }
	ValueHolder.prototype.value = function(value) {
		if (value !== undefined) {
			_value = value;
		}
		return _value;
	};

	ValueHolder.prototype.isEmpty = function () {
        for (let p in this) {
            if (this.hasOwnProperty(p) && (this[p] === null || this[p] === undefined || this[p] === '')) return false;
        }
        return true;
    };
	return new ValueHolder();
}


/**
 * Gathers data of the Element.
 * @param {boolean} [compact]
 * @returns {{}}
 */
Element.prototype.gatherData = function (compact) {
    if (compact === undefined) compact = true;
    let data = createValueHolder();

    let event = new Event('gather');
    this.triggerEvent('gather', data, event);

    if (!event.defaultPrevented) {
        gatherElementData(this, data, data, null, true);
    }

    if (data.value() === undefined) {
        let value = {};
        for (let p in data) if (data.hasOwnProperty(p)) value[p] = data[p];
        data = value;
    }else {
        data = data.value();
    }

    if (compact && typeof data === 'object') compactData(data);
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
    let children;
    let name = null;

    if (target.hasAttr('name') && target.attr('name') !== '') {
        name = target.attr('name');

        let event = new Event('gather');
        target.triggerEvent('gather', data, event);

        // Get value if element is <input/> or <select/>.
        if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName()) >= 0) {
            if (target.attr('type') === 'checkbox') {
                if (!target.prop('checked')) return data;
            }
            data.value(target.val());
            return data;
        }
    }

    if (typeof propName !== 'string') propName = name;

    // Process inclusion.
    if (target.hasInclusion()) {
        let tmp = createValueHolder();
        gatherInstanceData(target.inclusion(), tmp, null, curData, propName);

        if ((Object.keys(tmp).length > 0 || (typeof tmp.value === 'function' && tmp.value() !== undefined)) && !data.hasOwnProperty(propName)) {
            if (name !== null) {
                if (tmp.value() === undefined) {
                    if (Object.keys(tmp).length > 0) {
                        for (let p in tmp) if (tmp.hasOwnProperty(p)) data[p] = tmp[p];
                    }
                } else {
                    data.value(tmp.value());
                }
            } else {
                for (let p in tmp) {
                    if (tmp.hasOwnProperty(p)) data[p] = tmp[p];
                }
            }
        }

        // Gather child instances.
    } else if (target.hasChildUI()) {
        let res = [];
        if (name !== null || propName !== null) {
            children = target.children();
            for (let i = 0; i < children.length; i++) {
                let tmp = createValueHolder();
                gatherInstanceData(children[i], tmp, null, curData, propName);
                if (typeof tmp.value !== 'function' || tmp.value() === undefined) {
                    if (Object.keys(tmp).length > 0) {
                        let value = {};
                        for (let p in tmp) if (tmp.hasOwnProperty(p)) value[p] = tmp[p];
                        res.push(value);
                    }
                } else {
                    res.push(tmp.value());
                }
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
        for (let i = 0; i < children.length; i++) {
            if (children[i].getRootElement !== undefined) {
                let root = children[i].getRootElement();
                if(root.hasAttr('name')){
                    name = root.attr('name');
                }
                let tmp = createValueHolder();
                gatherInstanceData(children[i], tmp, null, curData, propName);
                if (name !== null) {
                    if (typeof tmp.value !== 'function' || tmp.value() === undefined) {
                        if (Object.keys(tmp).length > 0) {
                            let value = {};
                            for (let p in tmp) if (tmp.hasOwnProperty(p)) value[p] = tmp[p];
                            data[name] = value;
                        }
                    } else {
                        data[name] = tmp.value();
                    }
                } else {
                    for (let p in tmp) {
                        if (tmp.hasOwnProperty(p)) data[p] = tmp[p];
                    }
                }
            }
        }

        // Loop through native child nodes if target is an element on which gatherData() was called.
    } else if (gatherChildNodes === true) {
        let childNodes = target.__.node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i] === undefined || childNodes[i].element === undefined) continue;
            let elName = childNodes[i].element.attr('name');
            let tmp = createValueHolder();
            gatherElementData(childNodes[i].uielement, tmp, curData, elName === '' ? null : elName, true);
            if (typeof elName === 'string' && elName !== '') {
                if (typeof tmp.value !== 'function' || tmp.value() === undefined) {
                    if (Object.keys(tmp).length > 0) {
                        let value = {};
                        for (let p in tmp) if (tmp.hasOwnProperty(p)) value[p] = tmp[p];
                        data[elName] = value;
                    }
                } else {
                    data[elName] = tmp.value();
                }
            } else {
                for (let p in tmp) if (tmp.hasOwnProperty(p)) data[p] = tmp[p];
            }

        }
    }
}


/**
 * @param instance
 * @param result
 * @param scheme
 * @param curData
 * @param propName
 */
function gatherInstanceData(instance, result, scheme, curData, propName) {
    if (scheme === undefined || scheme === null) scheme = instance.__.ui.scheme;
    if (result === undefined) result = {};

    // Allow developer to define custom data gathering logic.
    let event = new Event('gather', {cancelable : true});
    instance.triggerEvent('gather', result, event);
    if(event.defaultPrevented){
        return;
    }
    instance.ui().triggerEvent('gather', instance, result, event);
    if(event.defaultPrevented) return;


    let v, keys, res;
    for (let p in scheme) {
        if (!scheme.hasOwnProperty(p) || !instance.hasOwnProperty(p)) continue;

        res = gatherElementData(instance[p], v = createValueHolder(), curData, propName);

        let name = instance[p].attr('name');
        if (typeof v.value === 'function' && v.value() !== undefined && name !== '') {
            addGatheredData(result, name, v.value());
        }else {
            keys = Object.keys(v);

            for(let k in v){
                if(v.hasOwnProperty(k)){
                    addGatheredData(result, k, v[k]);
                }
            }

            v = typeof v[keys[0]] === 'object' ? v[keys[0]] : result;
        }

        let s = scheme[p];
        if (typeof s === 'object') {
            gatherInstanceData(instance, v, s, curData, propName);
        }
    }
}

/**
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
    for (let p in data) {
        if(!data.hasOwnProperty(p)) continue;
        if (Array.isArray(data[p])) {
            let arr = [];
            let propName = null;
            for (let i = 0; i < data[p].length; i++) {
                if (typeof data[p][i] === 'object') {
                    let keys = Object.keys(data[p][i]);
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

/**
 * Clones element.
 * @returns {Element}
 */
Element.prototype.clone = function() {
    let newEl = new Element({});
    cloneObjectTo(this, newEl);
    cloneObjectTo(this.__, newEl.__);
    let oldNode = this.node();
    let newNode = oldNode.cloneNode(true);
    newNode.uielement = newEl;
    newEl.__.node = newNode;
    return newEl;
};






/**
 * !!! DEPRECATED !!!
 * In order to support old projects tabs functionality is kept.
 * Please use Tabs extension.
 *
 * Implements simple tabs behaviour.
 * @deprecated
 * @returns {boolean}
 */
Element.prototype.isTab = function () {
    return this.__.tabContainer !== null;
};

/**
 * Links element as tab for some container.
 * @deprecated
 * @param container
 */
Element.prototype.makeTabFor = function (container) {
    this.__.tabContainer = container;
    container.hide();
    let siblings = this.getAllNearbyElements();
    this.on('click', tabClickHandler);

    for(let i = 0, len = siblings.length; i < len; i++){
        if(siblings[i].isTab()){
            return this;
        }
    }

    this.addClass('active');
    container
        .addClass('active')
        .css({
            display: 'flex',
            opacity: 1
        });

    return this;
};


/**
 * Returns container which is linked contend for the element.
 * @deprecated
 * @returns {Element.tabContainer|*|null}
 */
Element.prototype.tabContainer = function () {
    return this.__.tabContainer;
};


/**
 * Click event handler of the tab.
 * @deprecated
 */
function tabClickHandler() {
    if (!this.isTab()) return;

    // Toggle tabs class.
    let c = this.getAllNearbyElements();
    for (let i = 0, len = c.length; i < len; i++) {
        if(c[i].isTab()){
            c[i].removeClass('active');
            c[i].__.tabContainer.fadeOut(100, function(){
                this.hide();
            });
        }
    }
    this.addClass('active');



    let container = this.__.tabContainer;

    // Process fade-in animation.
    setTimeout(function () {
        container.fadeIn(100, 'flex');
    }, 100);

    container.addClass('active');
}
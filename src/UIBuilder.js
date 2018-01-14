/**
 * The code name of the framework is JORA (Javascript Objects Recursive Aggregator).
 *
 * var data = new UIBuilder.DataAjax({url : '/index'});
 * var layout = UI('Main layout').renderTo('body').load(data);
 *
 * @author Roman Muravchuk <eas.roma@gmail.com>
 * @version 2.0.0
 * @date 15.11.2017
 */


var UIBuilder = (function () {


     // Add reset styles.
     (function(){
         var head  = document.getElementsByTagName('head')[0];
         var styleTag  = document.createElement('style');
         styleTag.innerHTML = '* {margin : 0; padding : 0}';
         var comment = document.createComment('--- RESET ---');
         head.appendChild(comment);
         head.appendChild(styleTag);
     })();



    /**
     * Helper function that splits string bu upper case.
     * @para {string} str
     * @return {Array}
     */
    function splitByUpperCase(str) {
        return str.replace(/([A-Z]+)/g, ",$1").replace(/^,/, '').split(',');
    }


    /**
     * Formats string to be useful in the "id" or "class" attribute.
     * @param {string} str
     * @return {string}
     */
    function makeClassName(str) {
        return splitByUpperCase(str).join('-').replace(' ', '-').toLowerCase();
    }


    /**
     * @var {object} Private variable that stores UIs.
     */
    var uilist = {};


    /**
     * Private method but used inside exported function.
     * @param {string} name Name of the UI.
     * @return {UI|null}
     */
    function getByName(name) {
        if (uilist.hasOwnProperty(name)) {
            return uilist[name];
        }
        return null;
    }


    /**
     * Exported function.
     * @param {string} uiName Name of the UI.
     * @return {UI|null}
     */
    function _uibuilder(uiName) {
        return getByName(uiName);
    }


    /**
     * Adding events support for the UIBuilder.
     */
    _uibuilder.__ = {};
    _uibuilder.__.events = {};
    addEventsImplementation.call(_uibuilder);


    /**
     * Returns array of registered UI.
     * @return {Array}
     */
    _uibuilder.listUI = function () {
        return Object.keys(uilist);
    };


    /**          Exceptions
     * ___________________________
     * ---------------------------
     *
     * This section contains exceptions definition.
     * Each new exception constructor should use base Exception constructor.
     * Use log() function to print exception message in the "cache" section.
     * Also you can use "name" property in your constructor that will be
     * printed after prefix and before main message.
     *
     * Usage example:
     *
     * try{
     *     if( myPlanetForm === 'flat' ) throw new Exception('Earth is flat!');
     * }catch(error){ error.log(); }
     *
     */


    /**
     * @var {string} String used as prefix in logging.
     */
    var logPrefix = 'UIBuilder >>>';


    /**
     * Logs message using consolerror(e) function.
     */
    function log(message) {
        if (Settings.logging) console.log(logPrefix + ' ' + message);
    }


    /**
     * Logs message using console.warn() function.
     */
    function warn(message) {
        if (Settings.logging) console.warn(logPrefix + ' ' + message);
    }


    /**
     * Logs message using console.error() function.
     */
    function error(message) {
        if (!Settings.logging) return;
        if (typeof message === 'string') {
            console.error(logPrefix + ' ' + message);
        } else if (message instanceof Exception) {
            message.log();
        } else {
            console.error(message);
        }
    }


    /**
     * Base exception constructor with log() method.
     * @param message (string) - Message of the exception.
     */
    function Exception(message) {
        this.message = message;
    }

    Exception.prototype = {
        log: function () {
            if (!Settings.logging) return;
            if (this.message === '') return; // Exit if nothing to log.

            var message = logPrefix; // Message to be printed into the log.

            if (this.hasOwnProperty('name')) message += ' ' + this.name; // Add name if specified.
            message += ' ' + this.message; // Add message text.

            if (!this.hasOwnProperty('type') || this.type === 'exception') {
                console.error(message);

            } else if (this.type === 'warning') {
                console.warn(message);

            } else {
                console.log(message);
            }
        }
    };


    function InvalidParamException(message) {
        Exception.call(this, message);
        this.name = 'Invalid parameter.';
    }

    InvalidParamException.prototype = Exception.prototype;


    // Invalid options on UI registration.
    function UIRegistrationException(message) {
        Exception.call(this, message);
        this.name = 'UI Registration.';
    }

    UIRegistrationException.prototype = Exception.prototype;


    // Exception about invalid scheme structure.
    function InvalidSchemeException(message) {
        Exception.call(this, message);
        this.name = 'Invalid scheme.';
    }

    InvalidSchemeException.prototype = Exception.prototype;


    // Error on building UI.
    function RenderingException(message) {
        Exception.call(this, message);
        this.name = 'Rendering error.';
    }

    RenderingException.prototype = Exception.prototype;


    // Error on setting parsing rule.
    function SettingsException(message) {
        Exception.call(this, message);
        this.type = 'warning';
        this.name = 'Settings error.';
    }

    SettingsException.prototype = Exception.prototype;


    // Error on loading data to the UIInstance.
    function UIInstanceLoadException(message) {
        Exception.call(this, message);
        this.name = 'Instance data loading.';
    }

    UIInstanceLoadException.prototype = Exception.prototype;


    // Error on loading data to the UIInstance.
    function UIElementLoadException(message) {
        Exception.call(this, message);
        this.name = 'Element data apply.';
    }

    UIElementLoadException.prototype = Exception.prototype;


    function UIDataException(message) {
        Exception.call(this, message);
        this.name = 'UI Data.';
    }

    UIDataException.prototype = Exception.prototype;


    function EventException(message) {
        Exception.call(this, message);
        this.name = 'Events';
    }

    EventException.prototype = Exception.prototype;


    /**       Settings
     * ___________________________
     * ---------------------------
     *
     * Settings object stores options which are used by the framework like RegExp used for parsing, etc.
     * To change some settings it's necessary to use setters which are defined in this section.
     * If you're going to add some settings, please implement setters for it.
     * For handling errors - write your own exception.
     * Settings object is not available as property of exported object. It's private.
     *
     * Available settings:
     * regexp_... - RegExp used for parsing scheme rules. Setter - setParsingRule().
     * If you implements your own settings - add it below.
     */

    var Settings = {

        // Regular expressions.
        regexp_id: /#\w+[_\-\w]*/ig,
        regexp_tagName: /@\w+[_\-\w]*/ig,
        regexp_class: /\.\w+[_\-\w\s\d]*/ig,
        regexp_attribute: /\[(\w+[_\-\w]*\s*=\s*[^;=]+[/_\-\w\d.\s]*(\s*;\s*)?)+\]/ig,
        regexp_property: /\((\w+[_\-\w]*\s*=\s*[^;=]+[/_\-\w\d.\s]*(\s*;\s*)?)+\)/ig,
        regexp_params: /\{(\w+[_\-\w]*\s*=\s*[^;=]+[#\(\),/_\-\w\d.\s]*(\s*;\s*)?)+\}/ig,
        regexp_childUI: /\|\s*\w*[_\-\w\s/]+[_\-\w\d\s]*/ig,
        regexp_include: /<<<\s*\w*[_\-\w\s]+[_\-\w\d\s]*/ig,

        // Flat that indicates whether logging is enabled.
        logging: true
    };


    /**
     * Setter of the rules parsing RegExp.
     * @param subjectOrRules (string)
     * @param regularExpression (RegExp | Object)
     * @throws InvalidParsingRuleException
     *
     * Example: UIBuilder.setParsingRule('include', /~\w*[_-\w\s]+/ig);
     */
    _uibuilder.setParsingRule = function (subjectOrRules, regularExpression) {
        try {

            if (typeof subjectOrRules === 'string') {

                if (!Settings.hasOwnProperty('regexp_' + subjectOrRules))
                    throw new SettingsException('Rule "' + subjectOrRules + '" is absent in the settings.');

                if (a.constructor !== RegExp)
                    throw new SettingsException('Trying to assign '
                        + typeof regularExpression + ' as parsing regular expression for ' + subjectOrRules + '.'
                    );

                Settings['regexp_' + parameters] = regularExpression;


            } else if (typeof subjectOrRules === 'object') {

                for (var p in subjectOrRules) {

                    if (Settings.hasOwnProperty('regexp_' + p)) {
                        if (a.constructor !== RegExp)
                            throw new SettingsException('Trying to assign '
                                + typeof regularExpression + ' as parsing regular expression for '
                                + subjectOrRules + '.'
                            );
                        Settings['regexp_' + p] = subjectOrRules[p];

                    } else {
                        throw new SettingsException('Rule "' + p + '" is absent in the settings.');
                    }
                }

            }

        } catch (e) {
            error(e);
        }
    };


    /**
     * Disables logging if false given.
     * @param {boolean} enable
     */
    _uibuilder.enableLogging = function (enable) {
        Settings.logging = enable !== false;
    };


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
    function addEventsImplementation() {
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
        };

        // Add pseudonym.
        this.off = this.removeEventListener;


        /**
         * Triggers event with name [[eventName]].
         * There are few arguments can be passed instead of date.
         * All the arguments (omitting event name) will be passed to the handlers.
         *
         * @param {string} eventName
         * @param {mixed} data
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
        this.target = null;
    }

    UIEvent.prototype.preventDefault = function () {
        this.canceled = true;
    };


    /**
     *             UI
     * ___________________________
     * ---------------------------
     *
     * Function used to recursively clone scheme elements into one object (target).
     * Each scheme element not depending on nesting level will be placed directly into the target.
     */
    function cloneSchemeLinear(scheme, target) {
        for (var p in scheme) {

            if (typeof scheme[p] === 'object') {
                cloneSchemeLinear(scheme[p], target);
                target[p] = {children: scheme[p]};

            } else if (typeof scheme[p] === 'string') {
                target[p] = scheme[p];
                target[p] = {children: scheme[p]};

            } else {
                throw new InvalidSchemeException('Value of the elemend must be string or object.');
            }

        }
    }


    /**
     * Parses element's parameters string into object.
     * All regular expressions used for parsing available in the settings.
     */
    function parseParameters(str) {
        var _result = {};
		
		
		// Parse parameters.
        _result.parameters = {};
        var prm = str.match(Settings.regexp_params);
        str = str.replace(Settings.regexp_params, '');
		

        // Get parameters array
        (prm !== null && prm.length > 0) ? prm = prm[0].slice(1, -1) : prm = '';  // Cut the brackets.
        prm = prm.split(';');

        // Put parameters into the result.
        for (i = 0; i < prm.length; i++) {
            p = prm[i].split('=');
            if (p.length === 2) {
                if (p[0].trim() === '') continue;
                _result.parameters[p[0].trim()] = p[1].trim();
            }
        }
		
		
		

        // Parse attributes.
        _result.attributes = {};

        // Get attributes array.
        var att = str.match(Settings.regexp_attribute);
        str = str.replace(Settings.regexp_attribute, '');
        (att !== null && att.length > 0) ? att = att[0].slice(1, -1) : att = ''; // Cut the brackets.
        att = att.split(';');


        // Put attributes into the result.
        var p;
        for (var i = 0; i < att.length; i++) {
            p = att[i].split('=');
            if (p.length === 2) {
                if (p[0].trim() === '') continue;
                _result.attributes[p[0].trim()] = p[1].trim();
            }
        }


        // Parse properties.
        _result.properties = {};
        var pr = str.match(Settings.regexp_property);
        str = str.replace(Settings.regexp_property, '');

        // Get properties array
        (pr !== null && pr.length > 0) ? pr = pr[0].slice(1, -1) : pr = '';  // Cut the brackets.
        pr = pr.split(';');

        // Put properties into the result.
        for (i = 0; i < pr.length; i++) {
            p = pr[i].split('=');
            if (p.length === 2) {
                if (p[0].trim() === '') continue;
                _result.properties[p[0].trim()] = p[1].trim();
            }
        }

        // Define tag name, id, class and child UI using regular expressions.
        _result.tag = str.match(Settings.regexp_tagName);
        _result.id = str.match(Settings.regexp_id);
        _result.class = str.match(Settings.regexp_class);
        _result.child = str.match(Settings.regexp_childUI);
        _result.include = str.match(Settings.regexp_include);

        // Cut special characters from the start.
        if (_result.tag !== null) _result.tag = _result.tag[0].slice(1).trim();
        if (_result.id !== null) _result.id = _result.id[0].slice(1).trim();
        if (_result.class !== null) _result.class = _result.class[0].slice(1).trim();
        if (_result.child !== null) _result.child = _result.child[0].slice(1).trim();
        if (_result.include !== null) _result.include = _result.include[0].slice(3).trim();

        return _result;
    }


    /**
     * UI constructor.
     * @param options (object)
     */
    function UI(options) {
        if (typeof options !== 'object') options = {};

        // List of elements.
        this.elements = {};
        this.scheme = options.hasOwnProperty('scheme') ? options.scheme : {};
        this.rules = options.hasOwnProperty('rules') ? options.rules : {};
        this.prefix = options.hasOwnProperty('prefix') ? options.prefix : '';
        this.name = options.hasOwnProperty('name') ? options.name : '';
        this.css = options.hasOwnProperty('css') ? options.css : null;

        if (this.css === null && options.hasOwnProperty('styles')) {
            this.css = options.styles;
        }

        this.cssLoaded = false;

        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        this.__.events = {};
        this.__.styleNode = null;
        this.__.data = options.hasOwnProperty('data') ? options.data : null;
        this.__.url = null;

        // Parameters to be used on rendering.
		if(options.hasOwnProperty('parameters')){
			this.__.params = options.parameters;
		}else if(options.hasOwnProperty('params')){
			this.__.params = options.params;
		}

        if (typeof this.scheme !== 'object')
            throw new InvalidSchemeException('Scheme must be an object. ' + typeof this.scheme + ' given.');

        // Clone all elements from scheme to 'elements' object.
        try {
            cloneSchemeLinear(this.scheme, this.elements);
        } catch (e) {
            error(e);
        }

        for (var p in options) {
            if (p.slice(0, 2) === 'on' && typeof options[p] === 'function') {
                this.addEventListener(p.slice(2), options[p]);
            }
        }
    }

    UI.prototype = {constructor: UI};


    /**
     * Adds event handler for the UI.
     * There are few events available:
     * - render
     * - destroy
     * - change
     * - unregister
     */
    addEventsImplementation.call(UI.prototype);


    /**
     * Recursively builds scheme into the target (UIElement or DOM node).
     * @param instance (UIInstance) - New instance of the UI.
     * @param ui (UI) - UI which is building.
     * @param scheme (object) -
     * @param target (node|UIElement)
     * @param atStart (boolean)
     */
    function buildScheme(instance, ui, scheme, target, atStart) {
        // Set default atStart value if it's not specified.
        if (typeof atStart !== 'boolean') atStart = false;

        // Throw error if instance is not exemplar of the UIInstance.
        if (instance instanceof UIInstance === false)
            throw new RenderingException('Second argument must be an UIInstance.');

        // Throw error if ui is not exemplar of the UI.
        if (ui instanceof UI === false)
            throw new RenderingException('Second argument must be an UI.');

        var params;     // Parameters of the single element (UIElement).
        var targetNode; // Node in which element will be placed.

        if (typeof scheme === 'object') {
            for (var elementName in scheme) {

                // Skip if element with the same name already exists.
                if (instance.hasOwnProperty(elementName)) continue;

                // Parse parameters for new element.
                if (typeof scheme[elementName] === 'string') {
                    params = parseParameters(scheme[elementName]);
                } else if (typeof scheme[elementName] === 'object') {
                    if (ui.rules.hasOwnProperty(elementName)) {
                        params = parseParameters(ui.rules[elementName]);
                    } else {
                        params = {
                            id: null,
                            class: makeClassName(elementName),
                            tag: 'div',
                            child: null,
                            include: null,
                            attributes: {},
                            properties: {},
                            parameters: {}
                        };
                    }
                }

                // Make default class if not set.
                if (params.class === '' || params.class === null) {
                    params.class = makeClassName(elementName);
                }

                var uiClass = makeClassName(ui.name.replace(' ', ','));
                if (ui.scheme === scheme && params.class !== uiClass) {
                    params.class = uiClass + ' ' + params.class;
                }

                params.name = elementName;

                // Create element.
                var element = new UIElement(params);
                element.__.uiinstance = instance;
                element.__.node.uiinstance = instance;

                // Render another UI if include is detected.
                if (params.include !== null) {

                    if (uilist.hasOwnProperty(params.include)) {
						for(var p in uilist[params.include].__.params){
							if(!params.parameters.hasOwnProperty(p)){
								params.parameters[p] = uilist[params.include].__.params[p];
							}
						}
                        element.__.inclusion = element.add(uilist[params.include], params.parameters);
                    } else {
                        throw new RenderingException('Required for including UI "' + params.include + '" is not registered yet.');
                    }

                }

                // Attach element into instance.
                instance[elementName] = element;

                // Set parent UIElement and define target node.
                if (target instanceof UIElement) {
                    element.__.parent = target;
                    target[elementName] = element;
                    targetNode = target.__.node;
                } else if (typeof target === 'string') {
                    targetNode = document.querySelector(target);
                } else {
                    targetNode = target;
                }

                // Append element to the container node.
                if (atStart) {
                    var first = targetNode.firstChild;
                    if (first !== null) {
                        targetNode.insertBefore(element.__.node, first);
                    } else {
                        targetNode.appendChild(element.__.node);
                    }
                } else {
                    targetNode.appendChild(element.__.node);
                }

                // Add nested schemes.
                if (typeof scheme[elementName] === 'object') {
                    for (var p in scheme[elementName]) {
                        buildScheme(instance, ui, scheme[elementName], element);
                    }
                }
            }
        }
    }


    /**
     * Renders UI into container.
     *
     * Example: UIBuilder('searchBar').renderTo('body');
     *
     * @param {node|string|UIElement} container - element in which UIInstance will be built
     * @param {boolean} atStart - if true, builds UI into start of the list (default - false)
     * @return {UIInstance}
     **/
    UI.prototype.renderTo = function (container, atStart, params) {
        var instance = new UIInstance(); // Create new UI instance.

        instance.__.ui = this; // Set ui property.

        // Set params if atStart flag is missing.
        if (typeof atStart === 'object' && typeof params !== 'object') params = atStart;

        // Set flag if instance should be built at the start or at the end.
        if (atStart !== true) atStart = false;


        // If we render UI into the UIElement of another UIInstance - make necessary links.
        if (container instanceof UIElement) {
            instance.__.parent = container;       // Set parent element for newly created instance.
            container.__.children.push(instance); // Add instance to the children list of the container.
        }

        // Build scheme recursively.
        try {
            buildScheme(instance, this, this.scheme, container, atStart);
        } catch (e) {
            error(e);
        }

        // Create <style/> tag if css property specified and styles are not loaded yet.
        if (!this.cssLoaded && this.css !== null) {

            var cssText = '';

            // Compose styles.
            for (var elName in this.css) {

                var elStyles = this.css[elName];

                // Check if element exists in the UI.
                if (!instance.hasOwnProperty(elName)) {

                    // At symbol at the start indicate abot media query or animation, so use it as is.
                    if (elName[0] === '@') {

                        cssText += elName + "{\n";
                        // Loop through css properties.
                        for (var p in elStyles) {

                            if (typeof elStyles[p] === 'string') {
                                cssText += '    ' + makeClassName(p) + ': ' + elStyles[p] + ";\n";
                            } else if (typeof elStyles[p] === 'object') {
                                value = '    ' + p + " {\n";
                                for (var s in elStyles[p]) {
                                    value += '        ' + makeClassName(s) + ': ' + elStyles[p][s] + ";\n";
                                }
                                value += "    }\n";
                                cssText += value;
                            }

                        }
                        cssText += "}\n";

                        continue;
                    } else {
                        warn('Rendering error. Style target "' + elName + '" is absent in the "' + this.name + '" UI.');
                        continue;
                    }

                }


                var el = instance[elName];

                // Define css selector of the element.
                var selector = el.__.id !== null ? '#' + el.__.id : '.' + el.__.class.split(' ').join('.');

                // If selector contains class - complement it with parent class.
                if (selector[0] === '.') {
                    var topParent = el.findTopLocalParent();
                    if (topParent !== null) {
                        selector = (topParent.__.id !== null ? '#' + topParent.__.id : '.' + topParent.__.class.split(' ').join('.')) + ' ' + selector;
                    }
                }
                cssText += selector + "{\n";
                // Loop through css properties.
                for (var p in elStyles) {
                    if (p[0] === '.' || p[0] === ':' || p[0] === ' ') {
                        continue;
                    }
                    cssText += '    ' + makeClassName(p) + ': ' + elStyles[p] + ";\n";
                }
                cssText += "}\n";

                // Process included styles.
                for (var p in elStyles) {
                    var sel = selector;
                    if (typeof elStyles[p] !== 'object') continue;
                    if (p[0] === '.' || p[0] === ':' || p[0] === ' ') {
                        sel += p;
                    } else {
                        continue;
                    }

                    cssText += sel + "{\n";
                    for (var prop in elStyles[p]) {
                        var s = elStyles[p][prop];
                        if (prop === 'content') s = "'" + s + "'";
                        cssText += '    ' + makeClassName(prop) + ': ' + s + ";\n";
                    }
                    cssText += "}\n";
                }
            }

            var head = document.getElementsByTagName('head')[0];
            var styleTag = document.createElement('style');
            styleTag.innerHTML = cssText;

            // Add comment if logging is enabled.
            if (Settings.logging) {
                var comment = document.createComment('--- ' + this.name + ' ---');
                head.appendChild(comment);
            }

            head.appendChild(styleTag);
            this.cssLoaded = true;
        }

        if (typeof params !== 'object') params = {};
        for (var p in this.__.params) {
            if (!params.hasOwnProperty(p)) params[p] = this.__.params[p];
        }

        instance.__.params = params;

        // Trigger 'render' event.
		var event = new UIEvent('render');
		event.target = this;
        this.triggerEvent('render', instance, params, event);

        return instance;
    };
	
	
	
	function checkUIParameters(data)
	{
		if (!data.hasOwnProperty('name'))
            throw new UIRegistrationException('Name of a new UI is not defined.');

        if (typeof data.name !== 'string')
            throw new UIRegistrationException('Name of a new UI is ' + (typeof data.rules) + '. String required.');

        if (uilist.hasOwnProperty(data.name))
            throw new UIRegistrationException('UI with name "' + data.name + '" already registered.');

        if (!data.hasOwnProperty('scheme'))
            throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" absent.');

        if (typeof data.scheme !== 'object')
            throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" is ' + (typeof data.scheme) + '. Object required.');

        if (!data.hasOwnProperty('rules')) data.rules = {};

        if (typeof data.rules !== 'object')
            throw new UIRegistrationException('Rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');
	}


    /**
     * Registers new UI.
     * @param data (object)
     * {
     *      name   : (string),
     *      scheme : (object),
     *      rule   : (object)
     *      prefix : (string)
     * }
     */
    function register(data) {
        checkUIParameters(data);
        uilist[data.name] = new UI(data);
        _uibuilder.triggerEvent('register', uilist[data.name]);
    }

    _uibuilder.register = register;


    /**
     *        UIInstance
     * ___________________________
     * ---------------------------
     *
     * UIInstance is representation of UI instances, kind of container of interface part.
     */


    /**
     *  Constructor of the UI instance.
     */
    function UIInstance() {
        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        this.__.events = {};
        this.__.ui = null;
        this.__.parent = null;
        this.__.data = null;
        this.__.params = {};
    }

    UIInstance.prototype = {constructor: UIInstance};

    // Add events supporting for UIInstance.
    addEventsImplementation.call(UIInstance.prototype);


    /**
     * Removes UIInstance from the parent UIElement.
     */
    UIInstance.prototype.remove = function () {
        // remove this instance from the parent children[] property
        var parent = this.__.parent;
        var scheme = this.__.ui.scheme;


        for (var p in scheme) {
            if (this[p].__.node.parentNode !== null)
                this[p].__.node.parentNode.removeChild(this[p].__.node);
        }

        if (parent instanceof UIElement !== true) return;

        for (var i = 0, len = parent.__.children.length; i < len; i++) {
            if (parent.__.children[i] === this) {
                parent.__.children.splice(i, 1);
                break;
            }
        }
    };


    /**
     * Returns UI of the instance.
     * @returns {UI|*}
     * @constructor
     */
    UIInstance.prototype.UI = function () {
        return this.__.ui;
    };


    /**
     * Returns parameters of the instance.
     * @returns {UI|*}
     * @constructor
     */
    UIInstance.prototype.params = function () {
        return this.__.params;
    };


    /**
     * Returns parent UIInstance.
     * @return UIInstance|null
     */
    UIInstance.prototype.parentUII = function () {
        var parent = this.__.parent;
        if (parent instanceof UIElement) return parent.__.uiinstance;
        return null;
    };


    /**
     * Loads data to the instance.
     * @param {object} data        Data to be loaded.
     * @param {boolean} replace        If true all existing data will be removed before loading.
     * @param {boolean} atStart        If true new data will be inserted into the start.
     */
    UIInstance.prototype.load = function (data, replace, atStart) {
        if (typeof replace !== 'boolean') replace = true;
        if (typeof atStart !== 'boolean') atStart = false;

        if (data instanceof UIData) {
            try {
                data.fetch(function (replace, atStart, response) {
                    this.load(response, replace, atStart);
                }.bind(this, replace, atStart));
                return this;
            } catch (e) {
                error(e);
            }
        }


        if (typeof data !== 'object') {
            //warn('Instance data loading error: invalid argument. Object is required but ' + typeof data + ' given.');
        }


        var event = new UIEvent('load');
        event.target = this;
        this.triggerEvent('load', data, event);

        // Stop loading if event was canceled by preventDefault() method.
        if (event.canceled) return this;


        if (typeof data === 'string') {
            var root = this.getRootElement();
            if (root !== null) {
                root.load(data, replace, atStart);
                return this;
            }
        }


        if (Array.isArray(data)) {
            var root = this.getRootElement();
            if (root !== null) {
                root.load(data, replace, atStart);
                return this;
            }
        }

        for (var p in data) {
            if (p === '__') continue; // Prevent from changing some initial properties.

            if (this.hasOwnProperty(p)) {

                var el = this[p];

                if (this[p] instanceof UIElement) {

                    var inclusion = el.inclusion(); // Included UIInstance
                    if (inclusion instanceof UIInstance) {

                        if (Array.isArray(data[p])) {
                            var root = inclusion.getRootElement();
                            if (root === null || !el.hasChildUI()) {
                                inclusion.load(data[p], replace, atStart);
                            } else {
                                try {
                                    root.load(data[p], replace, atStart);
                                } catch (e) {
                                    error(e);
                                }
                            }
                        } else {
                            inclusion.load(data[p], replace, atStart);
                        }


                    } else {
                        try {
                            this[p].load(data[p], replace, atStart);
                        } catch (e) {
                            error(e);
                        }
                    }

                } else {
                    el.load(data[p], replace, atStart);
                }


            }
        }
        return this;
    };


    /**
     * Returns top level UIElement that contains all another element.
     * If top level has few elements - null will be returned.
     * @returns {UIElement}
     */
    UIInstance.prototype.getRootElement = function () {
        var topLevel = Object.keys(this.__.ui.scheme);
        return topLevel.length === 1 && this.hasOwnProperty(topLevel[0]) ? this[topLevel[0]] : null;
    };


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
    function UIElement(params) {
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


        // Tabs behaviour properties.
        this.__.tabContainer = null;

        this.__.animation = null;
        this.__.fx = null;

        // Set data collector.
        this.__.data = params.data === undefined ? null : params.data;

        // Children is an array for the instances of child UI or inclusions (defined in the scheme as '|item' for example).
        // Do NOT add single child elements or other.
        this.__.children = [];

        // Events handlers container.
        this.__.events = {};


        // Attach attributes.
        for (var p in params.attributes) {
            this.__.node.setAttribute(p, params.attributes[p]);
        }
		
        // Set properties.
        for (var p in params.properties) {

            // Use prototype method if available.
            if (UIElement.prototype.hasOwnProperty(p) && typeof UIElement.prototype[p] === 'function') {
                UIElement.prototype[p].call(this, params.properties[p]);

                // Otherwise set node properties directly.
            } else {
                this.__.node[p] = params.properties[p];
            }
        }

        // set class and id
        if (typeof this.__.class === 'string') this.__.node.className = this.__.class;
        if (typeof this.__.id === 'string') this.__.node.id = this.__.id;
    }

    UIElement.prototype = {constructor: UIElement};


    /**
     * Checks if element has child UI.
     * @return {boolean}
     */
    UIElement.prototype.hasChildUI = function () {
        return this.__.child !== null;
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


    var nativeEvents = ['submit', 'abort', 'beforeinput', 'blur', 'click', 'compositionen',
        'compositionstart', 'compositionupdate', 'dblclick', 'error', 'focus', 'change',
        'focusin', 'focusout', 'input', 'keydown', 'keypress', 'keyup', 'load',
        'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover',
        'mouseup', 'resize', 'scroll', 'select', 'unload', 'wheel'
    ];

    /**
     * Implements specific events stystem.
     * UIElements need to handle native JS events so
     * do NOT use addEventsImplementation for UIElement!
     */
    UIElement.prototype.addEventListener = function (eventName, callback) {
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
            this.removeEventHandler(eventName, callback);
        } else {
            this.removeAllEventListeners(eventName);
        }
        return this;
    };


    UIElement.prototype.triggerEvent = function (eventName, data) {
        var args = [];
        for (var i = 1, len = arguments.length; i < len; i++) {
            args.push(arguments[i]);
        }

        if (eventName.slice(0, 2) === 'on') eventName = eventName.slice(2);
        if (!this.__.events.hasOwnProperty(eventName)) return this;

        var handlers = this.__.events[eventName];
        for (var i = 0; i < handlers.length; i++) {
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
        delete this.__.node.uiinstance[this.name];
        if (this.__.node.parentNode === null) return;
        this.__.node.parentNode.removeChild(this.__.node);
    };


    /**
     *
     * @param ui      (UI)   - UI that will be built into UIElement
     * @param atStart (bool) - If true, builds UI at the start of the list
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
     * @return {UIInstance}
     */
    UIElement.prototype.add = function (ui, atStart, params) {
        if (atStart === undefined || atStart === null) atStart = false;

        if (typeof ui === 'string') {
            if (uilist.hasOwnProperty(ui)) {
                ui = uilist[ui];
            } else {
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
        if (text === undefined) return this.__.node.innerText;
        this.__.node.innerText = text;
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

    UIElement.prototype.hide = function (animation, duration) {
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
		var s = getComputedStyle(node);
		// Store initial height styles.
		var h = node.style.cssText.match(/height\s*:\s*[\d\w%]+/i);
		h = h === null ? '' : h[0];
		// Set height to auto and store inner height.
		node.style.height = 'auto';
		var height = node.clientHeight;
		// Restore height style.
		node.style.cssText = node.style.cssText.replace(/height\s*:\s*auto/i, h);
		return height;
    };


    /**
     * Slides down element with specified duration.
     * @param {int} duration Animation duration in miliseconds (default is 250).
     * @return {UIElement} (itself)
     */
    UIElement.prototype.slideDown = function (duration) {
        if (typeof duration !== 'number') duration = 250;

        this.css({overflow : 'hidden'});

        this.animate({height: this.contentHeight()}, duration, function () {
            this.css({height: 'auto'});
        });
        this.__.fx = 'slideDown';

        return this;
    };


    /**
     * Slides up element with specified duration.
     * @param {integer} duration Animation duration in miliseconds (default is 250).
     * @return {UIElement} (itself)
     */
    UIElement.prototype.slideUp = function (duration) {
        // Exit if element is already expanded.
        if (this.outerHeight() === 0 || this.isHidden()) return this;

        if (typeof duration !== 'number') duration = 250

        this.animate({height: 0}, duration);
        this.__.fx = 'slideUp';

        return this;
    };


    /**
     * Slides up element with specified duration.
     * @param {integer} duration Animation duration in miliseconds (default is 250).
     * @return {UIElement} (itself)
     */
    UIElement.prototype.slideToggle = function (duration) {
        if (typeof duration !== 'number') duration = 250;

        // Exit if element is already collapsed.
        if (this.outerHeight() === 0 || this.isHidden() || this.__.fx === 'slideUp') {
            this.slideDown(duration);
        } else {
            this.slideUp(duration);
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
        var arr = [];
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
                this.__.node.style[p] = style[p];
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
     * @param {int} duration Fading duration in miliseconds.
     * @param {string} displayAs If set will be used to set display
     * css property before animation start.
	 * @param {function} callback
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
     * @param {int} duration Fading duration in miliseconds.
     * @param {string} displayAs If set will be used to set display
     * css property before animation start in case of fadeIn() method will be applied.
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
     * Animates css properties of the object.
     * @param {object} props Object with animated properties.
     * Keys are properties names and values are the end values.
     * @param {int} duration Duration in miliseconds.
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
            units[p] = styles[p].replace(/[\d.]/g, '');
            startVals[p] = parseFloat(styles[p].toString().replace(/[^\d.]/gi, ''));
            endVals[p] = parseFloat(endVals[p].toString().replace(/[^\d.]/gi, ''));
        }

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
                if (diff < 0) {
                    k2 = (1 - k2);
                    diff *= -1;
                }
                cssObj[p] = parseFloat((diff * k2).toFixed(5)) + units[p];
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
     * @param {mixed} data Data to be loaded into the element and/or children.
     * If [[data]] is object - all nested elements will be loaded with nested data.
     * String will be used as innerHTML.
     * Array produces child instances if child UI is specified for the element.
     *
     * @param {boolean} replace If true - existing content of the element will be deleted before loading.
     *
     * @param {boolean} atStart If new content will be inserted at the start of the element. Default is false.
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
                        if (!UIElement.prototype.hasOwnProperty(p) && !uilist.hasOwnProperty('p')) {
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
                    warn('Trying to load children for UIElement "' + this.__.name + '" without child UI.');
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
                        if (uilist.hasOwnProperty(p)) {
                            uilist[p].renderTo(this).load(data[p], replace, atStart);
                        }
                    }
                }

            }

        } else {
            throw new UIElementLoadException('Unsupported data type given (' + typeof data + '). Only string or object can be used.');
        }
        return this;
    };


    /**
     * Resets values of the inputs/selects inside the UIElement.
     * @param {boolean} compact
     * @returns {{}}
     */
    UIElement.prototype.resetValues = function () {
		
    };


    /**
     * Gathers data of the UIElement.
     * @param {boolean} compact
     * @returns {{}}
     */
    UIElement.prototype.gatherData = function (compact) {
        if (compact === undefined) compact = true;
        var data = {};
        gatherElementData(this, data, data, null, true);
        if (compact) compactData(data);
		console.log(data);
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


    /**
     *           Tabs
     * ___________________________
     * ---------------------------
     *
     * Implements simple tabs behaviour.
     *
     * @returns {boolean}
     */
    UIElement.prototype.isTab = function () {
        return this.__.tabContainer !== null;
    };


    /**
     * Links element as tab for some container.
     * @param container
     */
    UIElement.prototype.makeTabFor = function (container) {
        this.__.tabContainer = container;
        container.hide();
		var siblings = this.getAllNearbyElements();
        this.on('click', tabClickHandler);
		
		for(var i = 0, len = siblings.length; i < len; i++){
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
     * @returns {UIElement.tabContainer|*|null}
     */
    UIElement.prototype.tabContainer = function () {
        return this.__.tabContainer;
    };


    /**
     * Click event handler of the tab.
     */
    function tabClickHandler() {
        if (!this.isTab()) return;

        // Toggle tabs class.
        var c = this.getAllNearbyElements();
        for (var i = 0, len = c.length; i < len; i++) {
            if(c[i].isTab()){
				c[i].removeClass('active');
				c[i].__.tabContainer.fadeOut(100, function(){
					this.hide();
				});
			}
        }
        this.addClass('active');



        var container = this.__.tabContainer;

        // Process fade-in animation.
        setTimeout(function () {
            container.fadeIn(100, 'flex');
        }, 100);

        container.addClass('active');
    }




    /**
     *      Data collectors
     * ___________________________
     * ---------------------------
     *
     * Data collectors are the functions that encapsulate
     * data fetching process and provide unified procedure of the
     * returning fetched data.
     * Data returning is implemented by using a callback function
     * that will be called just after data received.
     * Also data collectors triggers all necessary events of the
     * UIData to which they was attached.
     *
     * Events that can be triggered:
     * - dataready (When data is successfully fetched)
     * - error (If error is occurred)
     *
     * @param {function} callback
     * @see UIData
     */
    function defaultCollector(callback) {
        if (typeof callback !== 'function') this.triggerEvent('error');
        callback(this.cache, this);
        this.triggerEvent('dataready', this.cache);
    }


    /**
     * Data collector that used in the UIDataAjax.
     * The AJAX request will be used to fetch data.
     * UIData object to which this collector is attached must have
     * next properties:
     * - url (URL address of the resources)
     * - method (POST or GET)
     *
     * @param {function} callback
     * @see UIDataAjax
     */
    function ajaxCollector(callback) {
        if (typeof callback !== 'function') {
            this.triggerEvent('error');
            error('Callback for the ajaxCollector is not a function (' + typeof callback + ' given).');
            return false;
        }

        if (typeof this.url !== 'string') {
            this.triggerEvent('error');
            error('URL for the ajaxCollector is not a string (' + typeof this.url + ' given).');
            return false;
        }

        var _uidata = this;

        var xhttp = new XMLHttpRequest();

        var _this = this;
        xhttp.onprogress = function (e) {
            if (e.lengthComputable) {
                _uidata.triggerEvent('progress', Math.ceil(e.loaded / e.total * 100));
            }
        };

        xhttp.onreadystatechange = function () {
            if (this.readyState != 4) return;

            if (this.status == 200) {

                // Make redirection if X-Redirect header is specified.
                var url = this.getResponseHeader('X-Redirect');
                if (url !== null) {
                    window.location.replace(url);
                } else {
                    _uidata.triggerEvent('error', this.status);
                }

                // Get data depending on content-type header.
                var data;
                var contentType = this.getResponseHeader("content-type");
                if (typeof contentType === 'string' && contentType.indexOf('json') >= 0) {
                    data = JSON.parse(this.responseText);
                } else {
                    data = this.responseText;
                }
                _uidata.cache = _uidata.cacheLifetime === null || _uidata.cacheLifetime > 0 ? data : null;
                _uidata.triggerEvent('dataready', data);
                _uidata.triggerEvent('complete', data);
                DataAjax.triggerEvent('complete', _uidata);
                _uidata.triggerEvent('progress', 100);
                if (typeof callback === 'function') callback(data, _uidata);

            } else {
                _uidata.triggerEvent('error', this.status);
                _uidata.triggerEvent('complete');
            }
            _uidata.lastFetchTime = Date.now();
            _uidata.ready = true;
        };

        xhttp.open(this.method, this.url, true);

        // Set header that indicates that request was made by AJAX.
        xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        if (this.method.toUpperCase() === 'POST') {
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            var data = [];
            for (var p in this._parameters) {
                data.push(encodeURIComponent(p) + '=' + encodeURIComponent(this._parameters[p]));
            }
            xhttp.send(data.join('&'));
        } else {
            xhttp.send();
        }

        return true;
    }


    /**
     *        Collections
     * ____________________________
     * ----------------------------
     * Will be implemented later :)
     *
     * @param items
     * @constructor
     */
    function Collection(items) {
        this.items = Array.isArray(items) ? [] : items;
    }

    Collection.prototype = Object.create(UIElement.prototype)

    Collection.prototype.remove = function () {
        for (var i = 0, len = this.items.length; i < len; i++) {
            this.items[i].remove();
        }
    };




    /**
     *       Data providers
     * ___________________________
     * ---------------------------
     *
     *
     * UIData is a kind of data provider that used to retrieve data
     * from some storages or resources or generate it itself.
     * To get data use fetch() method.
     * Also UIData provides events support.
     *
     * The data fetched by the UIData can be cached.
     * To use cache define "cacheLifetime" property when configuring the UIData.
     * If lifetime is null then cache will not be used.
     * If lifetime is zero (0) then cached data will be returning until the page will be refreshed.
     *
     * If you need to use some data on fetching process (AJAX or generating depending on user input, etc.)
     * the parameters() method can be used for this purposes.
     *
     * The next events are available:
     * - fetch (Occurres when fetch() method is called)
     * - progress (When another part of data is ready)
     * - dataready (When UIData is ready to return data)
     * - error (If error is occurred during data fetching an error event will be triggered)
     *
     * @param {object} params - Parameters that contains necessary data for fetching.
     * @constructor
     */
    function UIData(params) {
        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        this.__.events = {};

        this.ready = true;         // Flag if UIData is ready to fetching.
        this.cache = null;         // Data got by last fetch.
        this.cacheLifetime = null; // Lifetime of cache. Null - infinity.
        this.allowMultiple = true;

        // Set the collector.
        if (params.hasOwnProperty('collector')) {
            if (typeof params.collector !== 'function')
                throw new UIDataException('Collector must be a function but ' + typeof params.collector + ' given.');
            this.collector = params.collector;
        } else {
            this.collector = defaultCollector;
        }

        if (params.hasOwnProperty('onfetch') && typeof params.onfetch === 'function') {
            this.on('fetch', params.onfetch);
        }

        this.waitingLimit = params.hasOwnProperty('waitingTime') ? intval(params.waitingTime) : 3000;
        this.timeElapsed = 0;

        this.lastFetchTime = Date.now();
        this._parameters = params.hasOwnProperty('parameters') ? intval(params.parameters) : {};
    }

    UIData.prototype = {};


    /**
     * Sets parameters of the UIData. It can be used during fetching process.
     * For example in UIDataAjax parameters will be send with request.
     * @param parameters
     * @returns {UIData}
     */
    UIData.prototype.parameters = function (parameters) {
        this._parameters = parameters;
        return this;
    };
    UIData.prototype.params = UIData.prototype.parameters;


    /**
     * Fethces data by executing collector.
     */
    UIData.prototype.fetch = function (callback) {
        this.triggerEvent('fetch');
        if (typeof params === 'object') this.params = params;
        if ((this.allowMultiple || this.ready) && typeof this.collector === 'function') {
            this.ready = false;
            return this.collector(callback);
        }
        return false;
    };


    // Add events to the UIData's instances.
    addEventsImplementation.call(UIData.prototype);

    // Also add events to the UIData object globally.
    Object.defineProperty(UIData, '__', {
        value: {},
        configurable: false,
        enumerable: false,
        writeable: false
    });
    UIData.__.events = {};
    addEventsImplementation.call(UIData);

    _uibuilder.UIData = UIData;


    /**
     * Events are already implemented for UIData, so it's not necessary to add it here again.
     */
    function UIDataAjax(params) {
        UIData.call(this, params);
        this.url = params.hasOwnProperty('url') ? params.url : '';
        this.method = 'POST';
        this.collector = ajaxCollector;
    }

    UIDataAjax.prototype = Object.create(UIData.prototype);
    UIDataAjax.prototype.constructor = UIData;


    // Add events to the UIDataAjax object globally.
    addEventsImplementation.call(UIDataAjax);
    Object.defineProperty(UIDataAjax, '__', {
        value: {},
        configurable: false,
        enumerable: false,
        writeable: false
    });
    UIDataAjax.__.events = {};


    _uibuilder.UIDataAjax = UIDataAjax;


    /**
     *         Animation
     * ___________________________
     * ---------------------------
     *
     *
     * Animation is an object that calculates state changing
     * during period of the time.
     *
     * To start animation simply call run() method using callback function
     * as argument.
     *
     * On each step coefficient from 0 to 1 will be calculated and
     * passed to the callback function.
     *
     * To stop animation stop() method should be called or [[stopped]] property
     * can be set to true.
     *
     * @constructor
     * @param {object} options
     */
    function Animation(options) {
        this.start = options.start || 0;
        this.end = options.end || 0;
        this.duration = options.duration || 250;
        this.f = options.f || 'easeOutQuad';
        this.callback = options.callback;
        this.stopped = false;
    }

    _uibuilder.Animation = Animation;

    Animation.prototype = {constructor: Animation};

    Animation.prototype.run = function (callback) {
        var _this = this;
        var t_start = performance.now();
        var dur = _this.duration;

        function step() {
            if (_this.stopped) return;
            var t = performance.now();
            var n = t - t_start;
            var state = n / _this.duration;

            var k = Animation.f[_this.f](state, n, 0, 1, _this.duration);

            if (typeof callback === 'function') {
                callback(k);
            }

            if (t < t_start + dur) {
                requestAnimationFrame(step);
            } else if (k !== 1) {
                if (typeof callback === 'function') {
                    callback(1, true);
                }
            }
        }

        step();
    };


    /**
     * Stops the animation.
     * @see Animation
     */
    Animation.prototype.stop = function () {
        this.stopped = true;
    };


    /**
     * Animation functions.
     */
    Animation.f = {
        default: 'easeOutQuad',
        swing: function (x, t, b, c, d) {
            return Animation.f[Animation.f.default](x, t, b, c, d);
        },
        easeInQuad: function (x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function (x, t, b, c, d) {
            return c - Animation.f.easeOutBounce(x, d - t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d / 2) return Animation.f.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
            return Animation.f.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    };


    /**
     *          Spinner
     * ___________________________
     * ---------------------------
     *
     * Spinner is a special UI that provides few special methods:
     * showInside(target) - Shows spinner in the given container (UIElement or node).
     * hideInside(target) - Smoothly hides all spinners in the given container and after removes it.
     *
     * Also animation can be defined for fading effect.
     * This section will be done later.
     */
	function Spinner(params)
	{
		// Extending UI.
		UI.call(this, params);
	}
	Spinner.prototype = Object.create(UI.prototype);
	
	
	/**
	 * Renders spinner inside target element.
	 * Fades in just after rendering.
	 * Node that if you want to apply your own fading effects 
	 * please use onfadein event in the parameters.
	 */
	Spinner.prototype.showInside = function(target, params)
	{
		var s = this.renderTo(target, params);
		
		var event = new UIEvent('fadein');
		event.target = this;
		this.triggerEvent('fadein',s , event);
		
		// If event was not prevented - use default fading effect.
		if(!event.canceled){
			var root = s.getRootElement();
			if (root !== null) {
				root.css({opacity : 0}).fadeIn();
			}
		}
	};
	
	
	/**
	 * Hides all spinners inside target element.
	 * Fades out just before removing.
	 * Node that if you want to apply your own fading effects 
	 * please use onfadeout event in the parameters.
	 */
	Spinner.prototype.hideInside = function(target)
	{
		var children;
		if(target instanceof UIElement){
			children = target.children();
		}else{
			children = target.childNodes;
		}
		var arr = []
		for(var i = 0; i < children.length; i++){
			arr[i] = children[i];
		}
		for(var i = 0; i < arr.length; i++){
			var child = arr[i];
			if(!(child instanceof UIInstance)){
				child = child.uiinstance;
				if(!(child instanceof UIInstance)) continue;
			}
			if(child.UI() !== this) continue;
			
			var event = new UIEvent('fadeout');
			event.target = this;
			this.triggerEvent('fadeout',child , event);
			
			// If event was not prevented - use default fading effect and then remove spinner instance.
			if(!event.canceled){
				(function(){
					var root = child.getRootElement();
					if (root !== null) {
						root.animate({
							opacity : 0
						}, 250, function(){
							if(child !== undefined) child.remove();
						});
					}
				})();
			}
		}
	};
	
	
	// Add unique function for registering spinners.
	_uibuilder.registerSpinner = function(data){
		checkUIParameters(data);
        uilist[data.name] = new Spinner(data);
        _uibuilder.triggerEvent('register', uilist[data.name]);
	};
	
	


    /**
     *           Dropdowns
     * ___________________________
     * ---------------------------
     *
     * Methods that used for implementing dropdown mechanic.
	 * For marking dropdowns used speciall class - .dropdown
	 * If dropdown is shown - .shown class will be used.
     */
	
	


    /**
     *           Routes
     * ___________________________
     * ---------------------------
     *
     * Routes are the objects that encapsulates application state.
     * This section will be done later.
     */

    function Route(options) {
        if (!options.hasOwnProperty('path')) {
            throw new InvalidParamException('Route path is not specified.');
        }

        this.path = options.hasOwnProperty('path') ? options.path : null;

    }


    return _uibuilder;

})();


// Comment line below if you dont want to use pseudonym.
var UI = UIBuilder;
var Data = UI.UIData;
var DataAjax = UI.UIDataAjax;
var Route = UI.Route;
var Animation = UI.Animation;
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
        styleTag.innerHTML = '* {margin : 0; padding : 0; box-sizing: border-box;}';
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
        return splitByUpperCase(str.replace(' - ', '-')).join('-').replace(/([a-zA-Z_-])\s+([a-zA-Z_\-\d])/g, "$1-$2").toLowerCase();
    }


    /**
     * @var {object} Private variable that stores UIs.
     */
    var uiList = {};


    /**
     * Private method but used inside exported function.
     * @param {string} name Name of the UI.
     * @return {UI|null}
     */
    function getByName(name) {
        if (uiList.hasOwnProperty(name)) {
            return uiList[name];
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


    var csrfParam = 'csrf';
    var csrfToken = null;

    _uibuilder.setCsrfToken = function(token){
        if(csrfToken === null){
            if(typeof token === 'object'){
                csrfParam = Object.keys(token)[0];
                csrfToken = token[csrfParam];
            }else if(typeof token === 'string'){
                csrfToken = token;
            }
        }
    };



    var language = 'en';


    /**
     * Sets interface language.
     * @param {string} lang
     */
    _uibuilder.setLanguage = function(lang)
    {
        language = lang;
    };


    /**
     * Returns interface language.
     * @return {string}
     */
    _uibuilder.getLanguage = function()
    {
        return language;
    };



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
        return Object.keys(uiList);
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
     * Logs message using console.log(e) function.
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
        if (typeof subjectOrRules === 'string') {

            if (!Settings.hasOwnProperty('regexp_' + subjectOrRules))
                throw new SettingsException('Rule "' + subjectOrRules + '" is absent in the settings.');

            if (a.constructor !== RegExp)
                throw new SettingsException('Trying to assign '
                    + typeof regularExpression + ' as parsing regular expression for ' + subjectOrRules + '.'
                );

            Settings['regexp_' + subjectOrRules] = regularExpression;


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
            if(scheme.hasOwnProperty(p)){
                if (typeof scheme[p] === 'object') {
                    cloneSchemeLinear(scheme[p], target);
                    target[p] = {
                        name : p,
                        rules : '',
                        children: scheme[p]
                    };

                } else if (typeof scheme[p] === 'string') {
                    target[p] = {
                        name : p,
                        rules : scheme[p],
                        children: null
                    };

                } else {
                    throw new InvalidSchemeException('Value of the elemend must be string or object.');
                }
            }
        }
    }


    /**
     * Parses element's parameters string into the object.
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

        // Define instance constructor to implement methods.
        this.uiiConstructor = !options.hasOwnProperty('methods') ? UIInstance : (function(){
            function AnotherUIInstance(options){
                UIInstance.call(this, options);
            }
            AnotherUIInstance.prototype = Object.create(UIInstance.prototype);
            AnotherUIInstance.prototype.constructor = UIInstance;
            for(var p in options.methods){
                if(typeof options.methods[p] === 'function' && !UIInstance.prototype.hasOwnProperty(p)){
                    AnotherUIInstance.prototype[p] = options.methods[p];
                }
            }
            return AnotherUIInstance;
        })();

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

        for(var p in this.elements){
            if(this.rules.hasOwnProperty(p) && this.elements[p].rules === ''){
                this.elements[p].rules = this.rules[p];
            }
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

                var uiClass = makeClassName(ui.name);
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

                    if (uiList.hasOwnProperty(params.include)) {
                        for(var p in uiList[params.include].__.params){
                            if(!params.parameters.hasOwnProperty(p)){
                                params.parameters[p] = uiList[params.include].__.params[p];
                            }
                        }
                        element.__.inclusion = element.add(uiList[params.include], params.parameters);
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



    UI.prototype.getRootElement = function ()
    {
        var topLevel = Object.keys(this.scheme);
        return topLevel.length === 1 ? this.elements[topLevel[0]] : null;
    };


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

        var instance = new this.uiiConstructor(); // Create new UI instance.

        instance.__.ui = this; // Set UI property.

        // Set parameters if atStart flag is missing.
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


        // Create <style/> tag if CSS property specified and styles are not loaded yet.
        if (!this.cssLoaded && this.css !== null) {
            this.createStyles();
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



    UI.prototype.generateCSS = function(data, parentSelector)
    {
        if(parentSelector === undefined) parentSelector = '';
        var res = [];

        for(var elName in data)
        {
            var styles = data[elName];
            var cssText = '';
            var selector;

            // Check if element exists in the UI.
            if (!this.elements.hasOwnProperty(elName) && elName[0] === '@') {

                // Process CSS animation.
                if(elName.slice(0, 10) === '@keyframes'){
                    cssText += elName + "{\n";
                    for (var p in styles) {
                        if (typeof styles[p] === 'string') {
                            cssText += '    ' + makeClassName(p) + ': ' + (styles[p] === '' ? '""' : styles[p]) + ";\n";
                        } else if (typeof styles[p] === 'object') {
                            value = '    ' + p + " {\n";
                            for (var s in styles[p]) {
                                value += '        ' + makeClassName(s) + ': ' + styles[p][s] + ";\n";
                            }
                            value += "    }\n";
                            cssText += value;
                        }
                    }
                    cssText += "}\n";
                    res.push(cssText);

                    // Otherwise generate nested styles in case it is media query, print or something else.
                }else if(typeof styles === 'object'){
                    cssText += parentSelector + elName + "{\n";
                    cssText += this.generateCSS(styles);
                    cssText += "}\n";
                    res.push(cssText);
                }
                continue;
            }

            // Make selector.
            if(this.elements.hasOwnProperty(elName)){
                var params = parseParameters(this.elements[elName].rules);
                selector = params.id !== null ? '#' + params.id : '.' + (params.class !== null ? params.class.split(' ').join('.') : makeClassName(elName));
                selector = ' ' + selector;
            }else{
                selector = makeClassName(elName);
                //warn('Styles rendering issue. Style target "' + elName + '" is absent in the "' + this.name + '" UI.');
            }

            // Make root selector to encapsulate styles in the instance UI.
            var rootSelector = makeClassName(this.name);
            var root = this.getRootElement();
            if(root !== null){
                var params = parseParameters(root.rules);
                var rootClass = params.class !== null ? params.class.split(' ').join('.') : makeClassName(root.name);
                if(root === this.elements[elName]){
                    selector = '';
                }
                var rootSelector = params.id !== null ? '#' + params.id : '.' + makeClassName(this.name) + '.' + rootClass;
            }
            // Don't use root selector if it already presented.
            if(parentSelector.indexOf(rootSelector) >= 0 || selector.indexOf(rootSelector) >= 0) rootSelector = '';

            var index = res.length;
            res.push('');

            cssText += ((rootSelector + ' ' + parentSelector).trim() + selector).replace('  ', ' ').replace(' :', ':') + "{\n";
            for(var styleName in styles){
                var style = styles[styleName];

                if(typeof style === 'string' || typeof style === 'number'){
                    var s = style;
                    if(styleName === 'content'){
                        s = (style === '' ? '""' : '"'+style+'"');
                    }
                    cssText += '    ' + makeClassName(styleName) + ': ' + s + ";\n";

                }else if(style instanceof StyleGetter){
                    cssText += '    ' + makeClassName(styleName) + ': ' + style.getValue() + ";\n";

                }else if(typeof style === 'object'){
                    var obj = {};
                    obj[styleName] = style;
                    res.push(this.generateCSS(obj, parentSelector + selector));
                }
            }
            cssText += "}\n";
            res[index] = cssText;
        }
        return res.join("\n");
    };


    UI.prototype.createStyles = function()
    {
        var head = document.getElementsByTagName('head')[0];
        var styleTag = document.createElement('style');
        styleTag.setAttribute('data-ui', this.name);
        styleTag.ui = this;
        styleTag.innerHTML = this.generateCSS(this.css);

        // Add comment if logging is enabled.
        if (Settings.logging) {
            var comment = document.createComment('--- ' + this.name + ' ---');
            head.appendChild(comment);
        }

        head.appendChild(styleTag);
        this.cssLoaded = true;
    };



    function checkUIParameters(data)
    {
        if (!data.hasOwnProperty('name'))
            throw new UIRegistrationException('Name of a new UI is not defined.');

        if (typeof data.name !== 'string')
            throw new UIRegistrationException('Name of a new UI is ' + (typeof data.rules) + '. String required.');

        if (uiList.hasOwnProperty(data.name))
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
        uiList[data.name] = new UI(data);
        _uibuilder.triggerEvent('register', uiList[data.name]);
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


        // Trigger event on the UI.
        var event = new UIEvent('load');
        event.target = this.__.ui;
        this.__.ui.triggerEvent('load', this, data, event);
        if (event.canceled) return this;

        // Trigger event on the instance.
        event = new UIEvent('load');
        event.target = this;
        this.triggerEvent('load', data, event);
        if (event.canceled) return this;


        if (typeof data !== 'object') {
            //warn('Instance data loading error: invalid argument. Object is required but ' + typeof data + ' given.');
        }

        var root = this.getRootElement();
        if (typeof data === 'string') {

            if (root !== null) {
                root.load(data, replace, atStart);
                return this;
            }
        }


        if (Array.isArray(data)) {
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
                            var incRoot = inclusion.getRootElement();
                            if (incRoot === null || !el.hasChildUI()) {
                                inclusion.load(data[p], replace, atStart);
                            } else {
                                try {
                                    incRoot.load(data[p], replace, atStart);
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
            }else if(uiList.hasOwnProperty(p)){
                if (root !== null) {
                    uiList[p].renderTo(root, false).load(data[p], true, false);
                }
            }
        }
        this.triggerEvent('afterload');
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
            if (uiList.hasOwnProperty(ui)) {
                ui = uiList[ui];
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
        var s = getComputedStyle(node);
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
     * @param {int} duration Animation duration in milliseconds (default is 250).
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
     * @param {integer} duration Animation duration in miliseconds (default is 250).
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
     * @param {integer} duration Animation duration in miliseconds (default is 250).
     * @param {function} callback Function that will be called when animation will be finished.
     * @return {UIElement} (itself)
     */
    UIElement.prototype.slideToggle = function (duration, callback) {
        if (typeof duration !== 'number') duration = 250;

        // Exit if element is already collapsed.
        if (this.outerHeight() === 0 || this.isHidden() || this.__.fx === 'slideUp') {
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
     * @param {integer} duration Duration in milliseconds.
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
                        if (uiList.hasOwnProperty(p)) {
                            uiList[p].renderTo(this).load(data[p], replace, atStart);
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
     * @param {boolean} compact
     * @returns {{}}
     */
    UIElement.prototype.gatherData = function (compact) {
        if (compact === undefined) compact = true;
        var data = {};
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
     * - complete (When data fetching process is complete)
     * - dataready (When data is successfully fetched)
     * - error (If error is occurred)
     * - progress (If a part of all data was fetched. Percentage of the data done must be passed in the second argument.)
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
            warn('Callback for the ajaxCollector is not a function (' + typeof callback + ' given).');
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
            if (this.readyState !== 4) return;

            if (this.status === 200) {

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

        // Add CSRF token to the header if it's set and method is POST.
        if(_uidata.useCsrf && csrfToken !== null){
            xhttp.setRequestHeader(csrfParam, csrfToken);
        }


        if (this.method.toUpperCase() === 'POST') {
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            var data = [];
            for (var p in this._parameters) {
                data.push(encodeURIComponent(p) + '=' + encodeURIComponent(this._parameters[p]));
            }
            // Add CSRF token to the request if it's set and method is POST.
            if(_uidata.useCsrf && csrfToken !== null){
                data.push(csrfParam + '=' + csrfToken);
            }
            xhttp.send(data.join('&'));
        } else {
            xhttp.send();
        }

        return true;
    }






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
     * - fetch (Occurred when fetch() method is called)
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
        this.cacheLifetime = null; // Lifetime of cache. null - not used. 0 - until page refresh.
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
        if(parameters === undefined){
            return this._parameters;
        }
        this._parameters = parameters;
        return this;
    };
    UIData.prototype.params = UIData.prototype.parameters;


    /**
     * Fetches data by executing collector.
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
    function UIDataAjax(params)
    {
        UIData.call(this, params);
        this.useCsrf = params.hasOwnProperty('useCsrf') ? params.useCsrf : true;
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
     * WebSocket data provider.
     * Established connection and provides methods and events
     * to work with it.
     * Uses UIWebSocketCollector as data collector.
     * @param params
     * @constructor
     */
    function UIDataWS(params)
    {
        UIData.call(this, params);
        this.ws = params.ws;
        this.collector = UIWebSocketCollector;
    }
    UIDataWS.prototype = Object.create(UIData.prototype);
    UIDataWS.prototype.constructor = UIData;

    // Add events to the UIDataAjax object globally.
    addEventsImplementation.call(UIDataWS);
    Object.defineProperty(UIDataWS, '__', {
        value: {},
        configurable: false,
        enumerable: false,
        writeable: false
    });
    UIDataWS.__.events = {};
    _uibuilder.UIDataWS = UIDataWS;


    function UIWebSocketCollector(callback)
    {
        var _this = this;
        this.ws.send(this._parameters, function(data){
            callback.call(_this, data);
            _this.triggerEvent('dataready', _this, data);
        });
    }




    function UIWebSocket(params)
    {
        if(!window.WebSocket){
            console.warn('WebSocket is not supported by this browser.');
        }

        var formats = [UIWebSocket.FORMAT_JSON, UIWebSocket.FORMAT_TOKENIZED_JSON, UIWebSocket.FORMAT_RAW];

        this.format = params.hasOwnProperty('format') && formats.indexOf(params.format) >= 0 ? params.format : UIWebSocket.FORMAT_TOKENIZED_JSON;
        this.url = params.url;
        this.authRequestMessage = params.authRequestMessage ? params.authRequestMessage : null;
        this.authSuccessMessage = params.authSuccessMessage ? params.authSuccessMessage : 'authorized';
        this.authFailMessage = params.authFailMessage ? params.authFailMessage : 'authorization failed';
        this.conn = null;
        this.authorized = false;
        this.reconnectionInterval = params.reconnectionInterval ? params.reconnectionInterval : 5000;
        this.tokens = {};
        this.__ = {
            events : {}
        }
    }

    UIWebSocket.FORMAT_JSON = 'json';
    UIWebSocket.FORMAT_TOKENIZED_JSON = 'tokenized-json';
    UIWebSocket.FORMAT_RAW = 'text';


    UIWebSocket.prototype = {};
    addEventsImplementation.call(UIWebSocket.prototype);
    _uibuilder.WS = UIWebSocket;


    /**
     * Events:
     * - onconnect
     * - ondisconnect
     * - onauthstart
     * - onauthsuccess
     * - onauthfail
     * - onmessage
     * - onresponse
     * - onsend
     */
    UIWebSocket.prototype.connect = function()
    {
        if(this.conn !== null) return;
        var conn = new WebSocket(this.url);
        this.conn = conn;

        var _this = this;
        var ti;

        // Handle connection establishing.
        conn.onopen = function(){
            if(_this.authRequestMessage !== null){
                _this.conn.send(_this.authRequestMessage);
            }
            clearInterval(ti);
            _this.triggerEvent('connect');
        };

        // Handle losing connection and try to reconnect.
        conn.onclose = function() {
            _this.authorized = false;
            _this.conn = null;
            _this.tokens = {};
            ti = setTimeout(function(){
                _this.connect();
            }, _this.reconnectionInterval);
            _this.triggerEvent('disconnect');
        };

        // Handle incoming messages.
        conn.onmessage = function (e) {
            // Handle authorization if it's enabled.
            if(_this.authRequestMessage !== null) {
                if (e.data === _this.authSuccessMessage) {
                    _this.authorized = true;
                    _this.triggerEvent('authsuccess');
                    return;
                } else if (e.data === _this.authFailMessage) {
                    _this.authorized = false;
                    _this.triggerEvent('authfail');
                    return;
                }
            }

            // Trigger onmessage event if there is a raw message format is using.
            if(_this.format === UIWebSocket.FORMAT_RAW){
                _this.triggerEvent('message', e.data);


            }else if(_this.format === UIWebSocket.FORMAT_JSON){
                _this.triggerEvent('message', JSON.parse(e.data));

            }else if(_this.format === UIWebSocket.FORMAT_TOKENIZED_JSON) {
                var data = JSON.parse(e.data);
                if(!data.hasOwnProperty('Token')){
                    _this.triggerEvent('message', data);
                    return;
                }

                var token = data.Token;
                delete data.Token;

                // Ignore unregistered tokens.
                if(!_this.tokens.hasOwnProperty(token)){
                    return;
                }

                if(data.hasOwnProperty('Data')){
                    data = data.Data;
                }

                _this.triggerEvent('message', data);
                _this.triggerEvent('response', data);
                _this.tokens[token](data);
                delete _this.tokens[token];
            }
        };
    };



    UIWebSocket.prototype.send = function(data, callback) {
        if(this.conn === null) return;
        var d = new WebSocketData(data);
        this.tokens[d.token] = callback;
        this.conn.send(JSON.stringify(d));
        this.triggerEvent('send', d);
    };



    function randomId(length)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }



    function WebSocketData(data)
    {
        this.token = randomId(12) + Date.now();
        for(var p in data){
            if(!data.hasOwnProperty(p)) continue;
            this[p] = data[p];
        }
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

    Collection.prototype = Object.create(UIElement.prototype);

    Collection.prototype.remove = function () {
        for (var i = 0, len = this.items.length; i < len; i++) {
            this.items[i].remove();
        }
    };






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
        var duration = typeof options === 'number' ? options : 250;
        if(typeof options !== 'object') {
            options = {};
        }
        this.start = options.start || 0;
        this.end = options.end || 1;
        this.duration = options.duration || duration;
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
        var inst = this.renderTo(target, params);

        var event = new UIEvent('fadein');
        event.target = this;
        this.triggerEvent('fadein', inst, event);

        // If event was not prevented - use default fading effect.
        if(!event.canceled){
            var root = inst.getRootElement();
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
        var arr = [];
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
                var root = child.getRootElement();
                if (root !== null) {
                    root.animate({opacity : 0}, 250, function(){
                        if(child !== undefined) child.remove();
                    });
                }
            }
        }
    };


    // Add unique function for registering spinners.
    _uibuilder.registerSpinner = function(data){
        checkUIParameters(data);
        uiList[data.name] = new Spinner(data);
        _uibuilder.triggerEvent('register', uiList[data.name]);
    };




    /**
     *           Dropdowns
     * ___________________________
     * ---------------------------
     *
     * Methods that used for implementing dropdown mechanic.
     * For marking dropdowns used speciall class - .dropdown
     * If dropdown is shown - .shown class will be used.
     *
     * @return UIElement
     */
    UIElement.prototype.makeDropdown = function(target, collapseOnSecondClick)
    {
        this.addClass('dropdown-handle');
        target.addClass('dropdown');
        target.hide();
        this.__.dropdownTarget = target;
        target.__.dropdownHandle = this;
        this.on('click', dropdownHandler);
        return this;
    };


    /**
     * Dropdown click handler.
     */
    function dropdownHandler()
    {
        var expand = !this.hasClass('dropdown-expanded');
        var target = this.__.dropdownTarget;

        var event = new UIEvent('blur');
        target.triggerEvent('blur', this, event);

        // Stop do anything if event is canceled.
        if(event.canceled){
            return;
        }

        if(expand){
            this.addClass('dropdown-expanded');
            target.addClass('dropdown-expanded');
            event = new UIEvent('expand');
            target.triggerEvent('expand', this, event);
            // Use default expanding animation if event is canceled.
            if(!event.canceled){
                target.slideDown(100, function(){
                    this.css({display: 'flex'});
                });
            }
        }else{
            this.removeClass('dropdown-expanded');
            target.removeClass('dropdown-expanded');
            event = new UIEvent('collapse');
            target.triggerEvent('collapse', this, event);
            // Use default collapsing animation if event is canceled.
            if(!event.canceled){
                target.slideUp(100, function(){
                    this.css({display: 'none'});
                });
            }
        }
    }


    document.addEventListener('mousedown', function(e){
        var target = e.target;

        // Loop through parents to check if user clicked on the expanded.
        while( (
                       !(target.uielement instanceof UIElement)
                    || !(target.uielement.__.dropdownHandle instanceof UIElement)
                )
            && target !== document.body
        ){
            if(target.uielement instanceof UIElement && target.uielement.__.dropdownTarget instanceof UIElement){
                target = target.uielement.__.dropdownTarget.__.node;
                break;
            }
            if(target.uielement instanceof UIElement && target.uielement.__.dropdownHandle instanceof UIElement){
                target = target.uielement.__.node;
                break;
            }
            target = target.parentNode;
            if(target === null){
                break;
            }
        }

        var items = document.getElementsByClassName('dropdown-expanded');
        items = Array.prototype.slice.call(items);

        for(var i = 0, len = items.length; i < len; i++){
            console.log(5);
            if(items[i] === target) continue;
            if(items[i].uielement instanceof UIElement
                && items[i].uielement.__.dropdownTarget instanceof UIElement
                && items[i].uielement.__.dropdownTarget.__.node === target
            ){
                continue;
            }


            if(items[i].uielement instanceof UIElement){

                if(items[i].uielement.__.dropdownHandle instanceof UIElement){
                    if(items[i].uielement.__.dropdownHandle === target) continue;
                    items[i].uielement.removeClass('dropdown-expanded');
                    items[i].uielement.__.dropdownHandle.removeClass('dropdown-expanded');

                    // Collapse dropdown.
                    var event = new UIEvent('collapse');
                    items[i].uielement.triggerEvent('collapse', items[i].uielement, event);
                    if(!event.canceled){
                        items[i].uielement.slideUp(100, function(){
                            this.css({display: 'none'});
                        });
                    }
                }
            }
        }
    });




    /**
     *           Colors
     * ___________________________
     * ---------------------------
     *
     * Color is on object that represents color.
     * Can be used in any supported format: hex, RGBA, HSL.
     * Also provides few functions to manipulation: lighten(), darken(), saturated(), desaturated().
     */
    function Color(c) {
        if (!(this instanceof Color)) { return new Color(c); }
        if (typeof c === "object") {return c; }
        this.attachValues(toColorObject(c));
    }

    _uibuilder.Color = Color;


    function toColorObject(c) {
        var x, y, typ, arr = [], arrlength, i, opacity, match, a, hue, sat, rgb, colornames = [], colorhexs = [];
        c = w3trim(c.toLowerCase());
        x = c.substr(0,1).toUpperCase();
        y = c.substr(1);
        a = 1;
        if ((x === "R" || x === "Y" || x === "G" || x === "C" || x === "B" || x === "M" || x === "W") && !isNaN(y)) {
            if (c.length === 6 && c.indexOf(",") === -1) {
            } else {
                c = "ncol(" + c + ")";
            }
        }
        if (c.length !== 3 && c.length !== 6 && !isNaN(c)) {c = "ncol(" + c + ")";}
        if (c.indexOf(",") > 0 && c.indexOf("(") === -1) {c = "ncol(" + c + ")";}
        if (c.substr(0, 3) === "rgb" || c.substr(0, 3) === "hsl" || c.substr(0, 3) === "hwb" || c.substr(0, 4) === "ncol" || c.substr(0, 4) === "cmyk") {
            if (c.substr(0, 4) === "ncol") {
                if (c.split(",").length === 4 && c.indexOf("ncola") === -1) {
                    c = c.replace("ncol", "ncola");
                }
                typ = "ncol";
                c = c.substr(4);
            } else if (c.substr(0, 4) === "cmyk") {
                typ = "cmyk";
                c = c.substr(4);
            } else {
                typ = c.substr(0, 3);
                c = c.substr(3);
            }
            arrlength = 3;
            opacity = false;
            if (c.substr(0, 1).toLowerCase() === "a") {
                arrlength = 4;
                opacity = true;
                c = c.substr(1);
            } else if (typ === "cmyk") {
                arrlength = 4;
                if (c.split(",").length === 5) {
                    arrlength = 5;
                    opacity = true;
                }
            }
            c = c.replace("(", "");
            c = c.replace(")", "");
            arr = c.split(",");
            if (typ === "rgb") {
                if (arr.length !== arrlength) {
                    return emptyObject();
                }
                for (i = 0; i < arrlength; i++) {
                    if (arr[i] === "" || arr[i] === " ") {arr[i] = "0"; }
                    if (arr[i].indexOf("%") > -1) {
                        arr[i] = arr[i].replace("%", "");
                        arr[i] = Number(arr[i] / 100);
                        if (i < 3 ) {arr[i] = Math.round(arr[i] * 255);}
                    }
                    if (isNaN(arr[i])) {return emptyObject(); }
                    if (parseInt(arr[i]) > 255) {arr[i] = 255; }
                    if (i < 3) {arr[i] = parseInt(arr[i]);}
                    if (i === 3 && Number(arr[i]) > 1) {arr[i] = 1;}
                }
                rgb = {r : arr[0], g : arr[1], b : arr[2]};
                if (opacity === true) {a = Number(arr[3]);}
            }
            if (typ === "hsl" || typ === "hwb" || typ === "ncol") {
                while (arr.length < arrlength) {arr.push("0"); }
                if (typ === "hsl" || typ === "hwb") {
                    if (parseInt(arr[0]) >= 360) {arr[0] = 0; }
                }
                for (i = 1; i < arrlength; i++) {
                    if (arr[i].indexOf("%") > -1) {
                        arr[i] = arr[i].replace("%", "");
                        arr[i] = Number(arr[i]);
                        if (isNaN(arr[i])) {return emptyObject(); }
                        arr[i] = arr[i] / 100;
                    } else {
                        arr[i] = Number(arr[i]);
                    }
                    if (Number(arr[i]) > 1) {arr[i] = 1;}
                    if (Number(arr[i]) < 0) {arr[i] = 0;}
                }
                if (typ === "hsl") {rgb = hslToRgb(arr[0], arr[1], arr[2]); hue = Number(arr[0]); sat = Number(arr[1]);}
                if (typ === "hwb") {rgb = hwbToRgb(arr[0], arr[1], arr[2]);}
                if (typ === "ncol") {rgb = ncolToRgb(arr[0], arr[1], arr[2]);}
                if (opacity === true) {a = Number(arr[3]);}
            }
            if (typ === "cmyk") {
                while (arr.length < arrlength) {arr.push("0"); }
                for (i = 0; i < arrlength; i++) {
                    if (arr[i].indexOf("%") > -1) {
                        arr[i] = arr[i].replace("%", "");
                        arr[i] = Number(arr[i]);
                        if (isNaN(arr[i])) {return emptyObject(); }
                        arr[i] = arr[i] / 100;
                    } else {
                        arr[i] = Number(arr[i]);
                    }
                    if (Number(arr[i]) > 1) {arr[i] = 1;}
                    if (Number(arr[i]) < 0) {arr[i] = 0;}
                }
                rgb = cmykToRgb(arr[0], arr[1], arr[2], arr[3]);
                if (opacity === true) {a = Number(arr[4]);}
            }
        } else if (c.substr(0, 3) === "ncs") {
            rgb = ncsToRgb(c);
        } else {
            match = false;
            colornames = getColorArr('names');
            for (i = 0; i < colornames.length; i++) {
                if (c.toLowerCase() === colornames[i].toLowerCase()) {
                    colorhexs = getColorArr('hexs');
                    match = true;
                    rgb = {
                        r : parseInt(colorhexs[i].substr(0,2), 16),
                        g : parseInt(colorhexs[i].substr(2,2), 16),
                        b : parseInt(colorhexs[i].substr(4,2), 16)
                    };
                    break;
                }
            }
            if (match === false) {
                c = c.replace("#", "");
                if (c.length === 3) {c = c.substr(0,1) + c.substr(0,1) + c.substr(1,1) + c.substr(1,1) + c.substr(2,1) + c.substr(2,1);}
                for (i = 0; i < c.length; i++) {
                    if (!isHex(c.substr(i, 1))) {return emptyObject(); }
                }
                arr[0] = parseInt(c.substr(0,2), 16);
                arr[1] = parseInt(c.substr(2,2), 16);
                arr[2] = parseInt(c.substr(4,2), 16);
                for (i = 0; i < 3; i++) {
                    if (isNaN(arr[i])) {return emptyObject(); }
                }
                rgb = {
                    r : arr[0],
                    g : arr[1],
                    b : arr[2]
                };
            }
        }
        return colorObject(rgb, a, hue, sat);
    }


    function colorObject(rgb, a, h, s) {
        var hsl, hwb, cmyk, ncol, color, hue, sat;
        if (!rgb) {return emptyObject();}
        if (!a) {a = 1;}
        hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hwb = rgbToHwb(rgb.r, rgb.g, rgb.b);
        cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        hue = (h || hsl.h);
        sat = (s || hsl.s);
        ncol = hueToNcol(hue);
        color = {
            red : rgb.r,
            green : rgb.g,
            blue : rgb.b,
            hue : hue,
            sat : sat,
            lightness : hsl.l,
            whiteness : hwb.w,
            blackness : hwb.b,
            cyan : cmyk.c,
            magenta : cmyk.m,
            yellow : cmyk.y,
            black : cmyk.k,
            ncol : ncol,
            opacity : a,
            valid : true
        };
        color = roundDecimals(color);
        return color;
    }
    function emptyObject() {
        return {
            red : 0,
            green : 0,
            blue : 0,
            hue : 0,
            sat : 0,
            lightness : 0,
            whiteness : 0,
            blackness : 0,
            cyan : 0,
            magenta : 0,
            yellow : 0,
            black : 0,
            ncol : "R",
            opacity : 1,
            valid : false
        };
    }


    /**
     * Converts HSL color to the RGB color.
     * @param hue
     * @param sat
     * @param light
     * @returns {{r: (number|*), g: (number|*), b: (number|*)}}
     */
    function hslToRgb(hue, sat, light) {
        var t1, t2, r, g, b;
        hue = hue / 60;
        if ( light <= 0.5 ) {
            t2 = light * (sat + 1);
        } else {
            t2 = light + sat - (light * sat);
        }
        t1 = light * 2 - t2;
        r = hueToRgb(t1, t2, hue + 2) * 255;
        g = hueToRgb(t1, t2, hue) * 255;
        b = hueToRgb(t1, t2, hue - 2) * 255;
        return {r : r, g : g, b : b};
    }


    function hueToRgb(t1, t2, hue) {
        if (hue < 0) hue += 6;
        if (hue >= 6) hue -= 6;
        if (hue < 1) return (t2 - t1) * hue + t1;
        else if(hue < 3) return t2;
        else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
        else return t1;
    }


    /**
     * Converts RGB to the HSL.
     * @param r
     * @param g
     * @param b
     * @returns {{h: (number), s: (number), l: (number)}}
     */
    function rgbToHsl(r, g, b) {
        var min, max, i, l, s, maxColor, h, rgb = [];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;
        min = rgb[0];
        max = rgb[0];
        maxColor = 0;
        for (i = 0; i < rgb.length - 1; i++) {
            if (rgb[i + 1] <= min) {min = rgb[i + 1];}
            if (rgb[i + 1] >= max) {max = rgb[i + 1];maxColor = i + 1;}
        }
        if (maxColor === 0) {
            h = (rgb[1] - rgb[2]) / (max - min);
        }
        if (maxColor === 1) {
            h = 2 + (rgb[2] - rgb[0]) / (max - min);
        }
        if (maxColor === 2) {
            h = 4 + (rgb[0] - rgb[1]) / (max - min);
        }
        if (isNaN(h)) {h = 0;}
        h = h * 60;
        if (h < 0) {h = h + 360; }
        l = (min + max) / 2;
        if (min === max) {
            s = 0;
        } else {
            if (l < 0.5) {
                s = (max - min) / (max + min);
            } else {
                s = (max - min) / (2 - max - min);
            }
        }
        return {h : h, s : s, l : l};
    }


    /**
     * Converts number in decimal to the number in hex.
     * @param n {integer}
     * @returns {string}
     */
    function toHex(n) {
        var hex = n.toString(16);
        while (hex.length < 2) {hex = "0" + hex; }
        return hex;
    }


    /**
     * Checks if given value is hex number.
     * @param x
     * @returns {boolean}
     */
    function isHex(x) {
        return ('0123456789ABCDEFabcdef'.indexOf(x) > -1);
    }



    Color.prototype = {
        toRgbString : function () {
            return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
        },
        toRgbaString : function (alpha) {
            if(alpha === undefined) alpha = this.opacity;
            return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + alpha + ")";
        },
        toHwbString : function () {
            return "hwb(" + this.hue + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%)";
        },
        toHwbStringDecimal : function () {
            return "hwb(" + this.hue + ", " + this.whiteness + ", " + this.blackness + ")";
        },
        toHwbaString : function () {
            return "hwba(" + this.hue + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%, " + this.opacity + ")";
        },
        toHslString : function () {
            return "hsl(" + this.hue + ", " + Math.round(this.sat * 100) + "%, " + Math.round(this.lightness * 100) + "%)";
        },
        toHslStringDecimal : function () {
            return "hsl(" + this.hue + ", " + this.sat + ", " + this.lightness + ")";
        },
        toHslaString : function () {
            return "hsla(" + this.hue + ", " + Math.round(this.sat * 100) + "%, " + Math.round(this.lightness * 100) + "%, " + this.opacity + ")";
        },
        toCmykString : function () {
            return "cmyk(" + Math.round(this.cyan * 100) + "%, " + Math.round(this.magenta * 100) + "%, " + Math.round(this.yellow * 100) + "%, " + Math.round(this.black * 100) + "%)";
        },
        toCmykStringDecimal : function () {
            return "cmyk(" + this.cyan + ", " + this.magenta + ", " + this.yellow + ", " + this.black + ")";
        },
        toNcolString : function () {
            return this.ncol + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%";
        },
        toNcolStringDecimal : function () {
            return this.ncol + ", " + this.whiteness + ", " + this.blackness;
        },
        toNcolaString : function () {
            return this.ncol + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%, " + this.opacity;
        },
        toName : function () {
            var r, g, b, colorhexs = getColorArr('hexs');
            for (i = 0; i < colorhexs.length; i++) {
                r = parseInt(colorhexs[i].substr(0,2), 16);
                g = parseInt(colorhexs[i].substr(2,2), 16);
                b = parseInt(colorhexs[i].substr(4,2), 16);
                if (this.red == r && this.green == g && this.blue == b) {
                    return getColorArr('names')[i];
                }
            }
            return "";
        },
        toHexString : function () {
            var r = toHex(this.red);
            var g = toHex(this.green);
            var b = toHex(this.blue);
            return "#" +  r + g + b;
        },
        toRgb : function () {
            return {r : this.red, g : this.green, b : this.blue, a : this.opacity};
        },
        toHsl : function () {
            return {h : this.hue, s : this.sat, l : this.lightness, a : this.opacity};
        },
        toHwb : function () {
            return {h : this.hue, w : this.whiteness, b : this.blackness, a : this.opacity};
        },
        toCmyk : function () {
            return {c : this.cyan, m : this.magenta, y : this.yellow, k : this.black, a : this.opacity};
        },
        toNcol : function () {
            return {ncol : this.ncol, w : this.whiteness, b : this.blackness, a : this.opacity};
        },
        isDark : function (n) {
            var m = (n || 128);
            return (((this.red * 299 + this.green * 587 + this.blue * 114) / 1000) < m);
        },
        saturate : function (n) {
            var x, rgb, color;
            x = (n / 100 || 0.1);
            this.sat += x;
            if (this.sat > 1) {this.sat = 1;}
            rgb = hslToRgb(this.hue, this.sat, this.lightness);
            color = colorObject(rgb, this.opacity, this.hue, this.sat);
            this.attachValues(color);
        },
        desaturate : function (n) {
            var x, rgb, color;
            x = (n / 100 || 0.1);
            this.sat -= x;
            if (this.sat < 0) {this.sat = 0;}
            rgb = hslToRgb(this.hue, this.sat, this.lightness);
            color = colorObject(rgb, this.opacity, this.hue, this.sat);
            this.attachValues(color);
        },
        lighter : function (n) {
            var x, rgb, color;
            x = (n / 100 || 0.1);
            this.lightness += x;
            if (this.lightness > 1) {this.lightness = 1;}
            rgb = hslToRgb(this.hue, this.sat, this.lightness);
            color = colorObject(rgb, this.opacity, this.hue, this.sat);
            this.attachValues(color);
        },
        darker : function (n) {
            var x, rgb, color;
            x = (n / 100 || 0.1);
            this.lightness -= x;
            if (this.lightness < 0) {this.lightness = 0;}
            rgb = hslToRgb(this.hue, this.sat, this.lightness);
            color = colorObject(rgb, this.opacity, this.hue, this.sat);
            this.attachValues(color);
        },
        attachValues : function(color) {
            this.red = color.red;
            this.green = color.green;
            this.blue = color.blue;
            this.hue = color.hue;
            this.sat = color.sat;
            this.lightness = color.lightness;
            this.whiteness = color.whiteness;
            this.blackness = color.blackness;
            this.cyan = color.cyan;
            this.magenta = color.magenta;
            this.yellow = color.yellow;
            this.black = color.black;
            this.ncol = color.ncol;
            this.opacity = color.opacity;
            this.valid = color.valid;
        }
    };



    /**
     *           Templates
     * ___________________________
     * ---------------------------
     *
     * Template is a special object that encapsulates styles and
     * provides simple API to get/set properties, switching theme with
     * on-the-fly interface updating.
     */


    /**
     * @var {object} Object that describes CSS styles spell-checking regular expressions.
     */
    var styles = {
        // Border
        border : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        borderLeft : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        borderRight : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        borderTop : /(none|initial|d\{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        borderBottom : /(none|initial|\d{1,}px (solid|dashed|dotted) (#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        borderRadius : /(none|0|initial|\d+(px|%|em|rem))/i,
        borderWidth : /(0|initial|\d+(px|%|em|rem))/i,
        borderColor : /(initial|#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\))/i,
        borderStyle : /(initial|solid|dotted|dashed)/i,
        // Font
        fontSize : /(initial|inherit|(\d+(px|em|rem|%)))/i,
        fontStyle : /(initial|inherit|italic|normal)/i,
        color : /(initial|#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\))/i,
        backgroundColor : /(initial|#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\))/i,
        // Width
        width : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
        maxWidth : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
        minWidth : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
        // Height
        height : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
        minHeight : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
        maxHeight : /(initial|inherit|auto|(\d+(px|em|rem|%)))/i,
        display : /(none|block|inline|inline-block|flex|table|table-cell|table-row)/i,
        // Position
        position : /(initial|static|fixed|relativa|absolute)/i,
        top : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        left : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        bottom : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        right : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        position : /(initial|static|fixed|relativa|absolute)/i,
        // Margin
        margin : /(initial|0|(-?\d+(px|em|rem|%)(\s+-?\d+(px|em|rem|%)){0,3}))/i,
        marginTop : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        marginLeft : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        marginBottom : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        marginRight : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        // Padding
        padding : /(initial|0|(-?\d+(px|em|rem|%)(\s+-?\d+(px|em|rem|%)){0,3}))/i,
        paddingTop : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        paddingLeft : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        paddingBottom : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        paddingRight : /(initial|0|(-?\d+(px|em|rem|%)))/i,
        // Shadows
        boxShadow : /(initial|none|(inset\s+)?-?\d+(px|em|rem|%)?\s+-?\d+(px|em|rem|%)?\s+\d+(px|em|rem|%)?\s+(\d+(px|em|rem|%)?\s+)?(#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        textShadow : /(initial|none|(inset\s+)?-?\d+(px|em|rem|%)?\s+-?\d+(px|em|rem|%)?\s+\d+(px|em|rem|%)?\s+(\d+(px|em|rem|%)?\s+)?(#[a-fA-F\d]{3,6}|transparent|black|white|red|grey|blue|green|rgba\(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*\d?\.?\d{1,})?\)))/i,
        // Transform


    };


    /**
     * Exported function.
     */
    var _theme = (function()
    {
        var themes = {};
        var currentTheme = null;


        /**
         * Function that used in the UI definition
         * to retrieve style on CSS generating.
         * Returns StyleGetter for the given property name.
         *
         * Example of usage:
         *
         * style : {
         *     wrap : {
         *         backgroundColor: Theme('colors.primary')
         *     }
         * }
         *
         * In example above the backgroundProperty gets an instance
         * of the StyleGetter that indicates that when styles for
         * this UI will be generated the value must be fetched from the
         * theme dynamically.
         *
         * @param name
         * @returns {StyleGetter}
         */
        function t(name)
        {
            return new StyleGetter(name);
        }


        /**
         * Registers new theme.
         * Exported method.
         * Returns true if registration was successful or false if
         * theme with this name already exists.
         *
         * Example:
         *
         * Theme.register('Default', {
         *     colors : {
         *         primary : '#ff0000',
         *         secondary : '#366977'
         *     },
         *     // And so on...
         * });
         *
         * @param name {string}
         * @param {object} params
         * @return {boolean}
         */
        t.register = function(name, params)
        {
            if(!themes.hasOwnProperty(name)){
                themes[name] = new Theme(name, params);
                return true;
            }
            warn('Theme with name "' + name + '" is already registered.');
            return false;
        };


        /**
         * Switches to the theme with given name.
         * After theme switching all styles will be refreshed.
         * @param name {string}
         * @returns {boolean}
         */
        t.switchTo = function(name)
        {
            if(!themes.hasOwnProperty(name)){
                warn('Theme can\'t be switched because theme "' + name + '" is not registered.');
                return false;
            }
            currentTheme = themes[name];

            // Update styles.
            var styles = document.getElementsByTagName('style');
            for(var i = 0, len = styles.length; i < len; i++){
                if(styles[i].hasOwnProperty('ui')){
                    var ui = styles[i].ui;
                    styles[i].innerHTML = ui.generateCSS(ui.css);
                }
            }

            return true;
        };



        /**
         * Returns a value for the given style.
         * The name can be set using dot-syntax for the nested items.
         * If requested property is absent - 'initial' will be returned.
         *
         * Example:
         * var color = Theme('buttons.danger.bgColor');
         *
         * @param {string} name
         * @return {string|number}
         */
        t.getStyle = function(name)
        {
            if(currentTheme === null){
                warn('Theme is not selected');
                return 'initial';
            }

            // Get path and style name.
            var path = name.split('.');
            var style = path.pop();

            // If no path specified - return theme's style.
            if(path.length === 0){
                return currentTheme.getStyle(style);
            }

            // Look for style in the nested components (themes).
            var theme = currentTheme;

            do{
                var n = path.shift();
                if(!theme.components.hasOwnProperty(n)){
                    warn('Style with name "' + name + '" is absent in the current theme "' + currentTheme.name + '".');
                    return 'initial';
                }
                theme = theme.components[n];
            }while(path.length > 0);

            return theme.getStyle(style);
        };


        /**
         * Returns name of the currently selected theme.
         * Can returns null if theme is not selected yet.
         * @return {string|null}
         */
        t.getThemeName = function(){
            if(currentTheme === null){
                warn('Theme is not selected');
                return null;
            }
            return currentTheme.name;
        };


        /**
         * Adds new theme section (nested theme).
         * Sections usage example: Theme('button.backgroundColor')
         */
        t.addSection = function(name, params)
        {
            if(currentTheme === null){
                warn('Theme is not selected');
                return false;
            }

            if(currentTheme.components.hasOwnProperty(name)){
                warn('Component "' + name + '" already exists in the theme "' + currentTheme.name + '".');
                return false;
            }

            currentTheme.components[name] = new Theme(name, params);
            return true;
        };

        return t;
    })();


    _uibuilder.theme = _theme;


    /**
     * Theme constructor.
     * Not available outside the library.
     * @param name
     * @param params
     * @constructor
     */
    function Theme(name, params)
    {
        this.name = name;
        this.styles = {};
        this.components = {};

        if(typeof params === 'object'){
            for(var p in params){
                if(params.hasOwnProperty(p)){
                    if(typeof params[p] === 'object'){
                        this.components[p] = new Theme(p, params[p]);
                    }else{
                        this.styles[p] = params[p];
                    }
                }
            }
        }
    }
    Theme.prototype = {constructor: Theme};

    Theme.prototype.getStyle = function(name)
    {
        if(!this.styles.hasOwnProperty(name)){
            warn('Style with name "' + name + '" is absent in the current theme "' + _theme.getThemeName() + '".');
            return 'initial';
        }
        return this.styles[name];
    };



    /**
     * Constructor of objects that used to store theme links.
     */
    function StyleGetter(name)
    {
        this.name = name;

        // Property for colors modification.
        this._darken = 0;
        this._lighter = 0;
        this._alpha = undefined;
    }
    StyleGetter.prototype = {
        constructor : StyleGetter,
        getValue : function(){
            var value = _theme.getStyle(this.name);
            if(value instanceof Color){
                if(this._darker > 0) value.darken(this._darken);
                if(this._lighten > 0) value.lighter(this._lighter);
                value = value.toRgbaString(this._alpha);
            }
            return value;
        },
        alpha : function(value){
            this._alpha = value;
        },
        darken : function(amount){
            this._darken += amount;
        },
        lighter : function(amount){
            this._lighten += amount;
        }
    };



    /**
     *           Routes
     * ___________________________
     * ---------------------------
     *
     * Routes are the objects that encapsulates application state.
     * This section will be done later.
     */

    /**
     * List of the available routes.
     * @type {{}}
     */
    var routes = {};

    /**
     * Link to the current route.
     * @type {Route|null}
     */
    var curRoute = null;

    /**
     * Link to the previous route.
     * @type {Route|null}
     */
    var prevRoute = null;




    /**
     * Exported function.
     * Returns route by name.
     *
     * Also provides few global events:
     *
     * @event apply
     * The handlers accept 2 arguments: 'params' (object) and 'event' (UIEvent)
     * If event is canceled - the applying will be terminated.
     * Occurred just before route will be applied.
     *
     * @event leave
     * The handlers accept 3 arguments:
     * 'oldRoute' (string), 'newRoute' (string) and 'event' (UIEvent)
     * Occurred just after route has been applied.
     *
     * @return {Route|null}
     */
    var _router = function(route){
        if(!routes.hasOwnProperty(route)) return null;
        return routes[route];
    };

    // Define service property that encapsulates hidden data.
    Object.defineProperty(_router, '__', {
        value: {},
        configurable: false,
        enumerable: false,
        writeable: false
    });
    _router.__.events = {};
    // Add global routing events support.
    addEventsImplementation.call(_router);


    // Export router.
    _uibuilder.Route = _router;


    /**
     * Registers new route.
     * @param route
     * @returns {*}
     */
    _router.register = function(route){
        routes[route] = new Route(route);
        return routes[route];
    };

    /**
     * Simply returns current route.
     * @returns {Route|null}
     */
    _router.current = function(){
        return curRoute;
    };

    /**
     * Simply returns current route.
     * @returns {Route|null}
     */
    _router.previous = function(){
        return prevRoute;
    };


    /**
     * Applies route with given name if exists.
     * @param url {string}
     * @param params {object}
     * @return {boolean}
     */
    _router.apply = function(url, params){
        // Parse url
        var res = _url.parse(url, params);
        var route = _router(res.route);
        if(route !== null){
            route.apply(params);
            return true;
        }
        return false;
    };


    /**
     * Route that provides events for implementing routing logic.
     * @param route
     * @constructor
     */
    function Route(route) {
        this.route = route;

        // Define service property that encapsulates hidden data.
        Object.defineProperty(this, '__', {
            value: {},
            configurable: false,
            enumerable: false,
            writeable: false
        });

        this.__.events = {};
    }

    Route.prototype = {
        constructor : Route,

        /**
         * Applies route with given parameters.
         * Returns true if 'apply' event was triggered on the route.
         * If 'apply' event was canceled globally - false will be returned.
         * @return {boolean}
         */
        apply : function(params){
            // Trigger 'apply' event.
            var event = new UIEvent('apply');

            // Trigger globally and if user calls preventDefault()
            // method - stop execution.
            _router.triggerEvent('apply', params, event);
            if(event.canceled) return false;

            // Trigger apply event on the route.
            this.triggerEvent('apply', params, event);
            history.pushState(params, '', ('/' + this.route).replace('//', ''));

            // Store old route.
            prevRoute = curRoute;

            // Set new current route.
            curRoute = this;

            // Trigger globally and if user calls preventDefault()
            // method - stop execution.
            if(prevRoute instanceof Route){
                // Trigger 'leave' event.
                event = new UIEvent('leave');

                _router.triggerEvent('leave', prevRoute.route, curRoute.route, event);
                if(event.canceled) return true;

                prevRoute.triggerEvent('leave', prevRoute.route, curRoute.route, event);
            }
            return true;
        },

        runParentRoute : function(params){
            var arr = this.route.split('/');
            if(arr.length < 2){
                return false;
            }
            arr.pop();
            var parentRoute = arr.join('/');
            var route = _router(parentRoute);

            if(route !== null){
                var event = new UIEvent('apply');
                route.triggerEvent('apply', params, event);
            }
            return false;
        }
    };

    // Add events support for the Route.
    addEventsImplementation.call(Route.prototype);

    // Create default route.
    curRoute = _router.register('/');



    /**
     *           URL
     * ___________________________
     * ---------------------------
     *
     * Url is a function that creates url depending on the given route.
     * In other words it refines given url by adding/changing some parts of it.
     * The manipulations with url will be done by the functions from 'urlRefiners' object.
     * It can be changed using URL.setRefiner(function(){...});
     */

    /**
     * List of the registered refiners.
     * Each refiner accepts one argument - url (string)
     * and returns another url (string) after some manipulations (adding language for example).
     * All refiners will be called one by one passing the result of previous as argument to the next one.
     * @type {{}}
     */
    var urlRefiners = {};

    /**
     * List of registered parsers.
     * Each parser accepts 2 arguments:
     * - url {string} Urt to be parsed.
     * - params {object} Object in which url parameters can be added.
     * @type {{}}
     */
    var urlParsers = {};


    /**
     * Generates url using refining function.
     * @param route {string}
     * @param params {object}
     * @private
     */
    var _url = function(route, params){
        for(var p in urlRefiners){
            route = urlRefiners[p](route, params);
        }
        return route;
    };
    _uibuilder.Url = _url;


    /**
     * Registers refiner with the given name.
     * @param name {string}
     * @param refiner {function}
     */
    _url.setRefiner = function(name, refiner){
        if(typeof refiner === 'function'){
            urlRefiners[name] = refiner;
        }
    };


    /**
     * Registers parser with the given name.
     * @param name {string}
     * @param parser {function}
     */
    _url.setParser = function(name, parser){
        if(typeof parser === 'function'){
            urlParsers[name] = parser;
        }
    };


    /**
     * Parses url into route and parameters.
     * @param url {string}
     * @param params {object|undefined}
     * @returns {{route: *, params: *}}
     */
    _url.parse = function(url, params){
        if(typeof params !== 'object') params = {};
        for(var p in urlParsers){
            var res = urlParsers[p](url, params);
            url = res.url;
            params = res.params;
        }
        return {route : url, params : params};
    };

    return _uibuilder;

})();


// Comment line below if you don't want to use pseudonym.
var UI = UIBuilder;
var Theme = UI.theme;
var Data = UI.UIData;
var DataAjax = UI.UIDataAjax;
var DataWS = UI.UIDataWS;
var WS = UI.WS;
var Route = UI.Route;
var Url = UI.Url;
var Animation = UI.Animation;
var Color = UI.Color;
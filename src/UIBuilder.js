/**
 * The code name of the framework is JORA (Javascript Objects Recursive Aggregator).
 *
 * var data = new UIBuilder.DataAjax({url : '/index'});
 * var layout = UI('Main layout').renderTo('body').load(data);
 *
 * @author Roman Muravchuk <eas.roma@gmail.com>
 * @version 1.0.0
 * @date 15.11.2017
 */


var UIBuilder = (function()
{


/**
 * Helper function that splits string bu upper case.
 * @para {string} str
 * @return {array}
 */
function splitByUpperCase(str)
{
	 return str.replace(/([A-Z]+)/g, ",$1").replace(/^,/, '').split(',');
}


/**
 * Formats string to be useful in the "id" or "class" attribute.
 * @param {string} str
 * @return {string} 
 */
function makeClassName(str)
{
	return splitByUpperCase(str).join('-').toLowerCase();
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
function getByName(name)
{
    if(uilist.hasOwnProperty(name)){
		return uilist[name];
	}
    return null;
}


/**
 * Exported function.
 * @param {string} uiName Name of the UI.
 * @return {UI|null}
 */
function _uibuilder(uiName)
{
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
 * @return {array}
 */
_uibuilder.listUI = function()
{
	return Object.keys(uilist);
}




/*          Exceptions
	___________________________
	---------------------------

	This section contains exceptions definition.
	Each new exception constructor should use base Exception constructor.
	Use log() function to print exception message in the "cache" section.
	Also you can use "name" property in your constructor that will be 
	printed after prefix and before main message.

	Usage example:

	try{
	   if( earth === 'flat' ) throw new Exception('The Earth is flat!');
    }catch(error){ error.log(); }
 
*/ 


/**
 * @var {string} String used as prefix in logging.
 */
var logPrefix = 'UIBuilder >>>';


/**
 * Logs message using consolerror(e) function.
 */
function log(message)
{
	if(Settings.logging) console.log(logPrefix + ' ' + message);
}


/**
 * Logs message using console.warn() function.
 */
function warn(message)
{
	if(Settings.logging) console.warn(logPrefix + ' ' + message);
}


/**
 * Logs message using console.error() function.
 */
function error(message)
{
	if( !Settings.logging ) return;
	if(typeof message === 'string'){
		console.error(logPrefix + ' ' + message);
	}else if(message instanceof Exception){
		message.log();
	}else{
		console.error(message);
	}
}


/**
 * Base exception constructor with log() method.
 * @param message (string) - Message of the exception.
 */
function Exception(message)
{
    this.message = message;
}

Exception.prototype = {
    log : function()
    {
		if(!Settings.logging) return;
        if(this.message === '') return; // Exit if nothing to log.

        var message = logPrefix; // Message to be printed into the log.

        if( this.hasOwnProperty('name') ) message += ' ' + this.name; // Add name if specified.
        message += ' ' + this.message; // Add message text.

        if( !this.hasOwnProperty('type') || this.type === 'exception'){
            console.error(message);

        }else if(this.type === 'warning'){
            console.warn(message);

        }else{
            console.log(message);
        }
    }
};


function InvalidParamException(message)
{
	Exception.call(this, message);
	this.name = 'Invalid parameter.';
}
InvalidParamException.prototype = Exception.prototype;


// Invalid options on UI registration.
function UIRegistrationException(message)
{
    Exception.call(this, message);
    this.name = 'UI Registration.';
}
UIRegistrationException.prototype = Exception.prototype;


// Exception about invalid scheme structure.
function InvalidSchemeException(message)
{
    Exception.call(this, message);
    this.name = 'Invalid scheme.';
}
InvalidSchemeException.prototype = Exception.prototype;


// Error on building UI.
function RenderingException(message)
{
    Exception.call(this, message);
    this.name = 'Rendering error.';
}
RenderingException.prototype = Exception.prototype;


// Error on setting parsing rule.
function SettingsException(message)
{
    Exception.call(this, message);
	this.type = 'warning';
    this.name = 'Settings error.';
}
SettingsException.prototype = Exception.prototype;


// Error on loading data to the UIInstance.
function UIInstanceLoadException(message)
{
    Exception.call(this, message);
    this.name = 'Instance data loading.';
}
UIInstanceLoadException.prototype = Exception.prototype;


// Error on loading data to the UIInstance.
function UIElementLoadException(message)
{
    Exception.call(this, message);
    this.name = 'Element data apply.';
}
UIElementLoadException.prototype = Exception.prototype;


// 
function UIDataException(message)
{
    Exception.call(this, message);
    this.name = 'UI Data.';
}
UIDataException.prototype = Exception.prototype;


function EventException(message)
{
	Exception.call(this, message);
	this.name = 'Events';
}
EventException.prototype = Exception.prototype;




/*           Settings
    ___________________________
    ---------------------------

    Settings object stores options which are used by the framework like RegExp used for parsing, etc.
    To change some settings it's necessary to use setters which are defined in this section.
    If you're going to add some settings, please implement setters for it.
    For handling errors - write your own exception.
    Settings object is not available as property of exported object. It's private.

    Available settings:
   
    regexp_... - RegExp used for parsing scheme rules. Setter - setParsingRule().
	If you implements your own settings - add it below.
	 
*/

var Settings = {
	
	// Regular expressions.
    regexp_id        : /#\w+[_-\w]*/ig,
    regexp_tagName   : /@\w+[_-\w]*/ig,
    regexp_class     : /\.\w+[_-\w\s\d]*/ig,
    regexp_attribute : /\[(\w+[_-\w]*\s*=\s*[^;=]+[/_-\w\d\.\s]*(\s*;\s*)?)+\]/ig,
    regexp_property  : /\((\w+[_-\w]*\s*=\s*[^;=]+[/_-\w\d\.\s]*(\s*;\s*)?)+\)/ig,
    regexp_childUI   : /\|\s*\w*[_-\w\s]+[_-\w\d\s]*/ig,
	regexp_include   : /<<<\s*\w*[_-\w\s]+[_-\w\d\s]*/ig,
	
	// Flat that indicates whether logging is enabled.
	logging 		 : true
};



/**
 * Setter of the rules parsing RegExp.
 * @param subjectOrRules (string)
 * @param reglarExpresstion (RegExp | Object)
 * @throws InvalidParsingRuleException
 *
 * Example: UIBuilder.setParsingRule('include', /~\w*[_-\w\s]+/ig);
 */
_uibuilder.setParsingRule = function(subjectOrRules, regularExpression)
{
    try{

        if(typeof subjectOrRules === 'string'){

            if( !Settings.hasOwnProperty('regexp_' + subjectOrRules) ) 
                throw new SettingsException('Rule "' + subjectOrRules + '" is absent in the settings.');

            if(a.constructor !== RegExp) 
                throw new SettingsException('Trying to assign ' 
					+ typeof regularExpression + ' as parsing regular expression for ' + subjectOrRules + '.'
				);
            
            Settings['regexp_' + parameters] = regularExpression;


        }else if(typeof subjectOrRules === 'object'){

            for(var p in subjectOrRules){

                if(Settings.hasOwnProperty('regexp_' + p)){
                    if(a.constructor !== RegExp) 
						throw new SettingsException('Trying to assign ' 
							+ typeof regularExpression + ' as parsing regular expression for ' 
							+ subjectOrRules + '.'
						);
                    Settings['regexp_' + p] = subjectOrRules[p];

                }else{
                    throw new SettingsException('Rule "' +  p + '" is absent in the settings.');
                }
            }

        }

    }catch(e){
		error(e);
	}
}


/**
 * Disables logging if false given.
 * @param {boolean} enable
 */
_uibuilder.enableLogging = function(enable)
{
	Settings.logging = enable !== false;
}






/*    Evens implementation
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
    /**
     * Adds event listener for the event with name [[eventName]].
     * @param {string} eventName
     * @param {function} handler
     * @throw EventException
     */
	this.addEventListener = function(eventName, handler)
	{
		if( typeof handler !== 'function' ) throw new EventException('Type of handler is not a function');
		if( !this.__.events.hasOwnProperty(eventName) ) this.__.events[eventName] = [];
		if( this.__.events[eventName].indexOf(handler) >= 0) return;
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
	this.removeEventListener = function(eventName, handler)
	{
		if( typeof handler !== 'function' ) throw new EventException('Type of handler is not a function');
		if( !this.__.events.hasOwnProperty(eventName) ) return;
		var index = this.__.events[eventName].indexOf(handler);
		if(index < 0) return;
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
	this.triggerEvent = function(eventName, data)
	{
		var args = [];
		for(var i = 1, len = arguments.length; i < len; i++){
			args.push(arguments[i]);
		}
		
		if( !this.__.events.hasOwnProperty(eventName) ) return;
		for(var i = 0; i < this.__.events[eventName].length; i++){
			this.__.events[eventName][i].apply(this, args);
		}
	};
	
	this.trigger = this.triggerEvent;
}












//             UI
// ___________________________
// ---------------------------




/*
 *  Function used to recursively clone scheme elements into one object (target).
 *  Each scheme element not depending on nesting level will be placed directly into the target.
 */
function cloneSchemeLinear(scheme, target)
{
    for(var p in scheme){

        if( typeof scheme[p] === 'object' ){
            cloneSchemeLinear(scheme[p], target);
            target[p] = {children : scheme[p]};

        }else if(typeof scheme[p] === 'string'){
            target[p] = scheme[p];
            target[p] = {children : scheme[p]};

        }else{
            throw InvalidSchemeException('Value of the elemend must be string or object.');
        }

    }
}


/**
 * Parses element's parameters string into object.
 * All regular expressions used for parsing available in the settings.
 */
function parseParameters(str)
{
    var _result = {};

    // Parse attributes.
    _result.attributes = {};

    // Get attributes array.
    var att = str.match(Settings.regexp_attribute);
	str = str.replace(Settings.regexp_attribute, '');
    (att !== null && att.length > 0) ? att = att[0].slice(1, -1) : att = ''; // Cut the brackets.
    att = att.split(';');
	
	

    // Put attributes into the result.
    var p;
    for(var i = 0; i < att.length; i++){
        p = att[i].split('=');
        if(p.length === 2){
            if( p[0].trim() === '' ) continue;
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
    var p;
    for(var i = 0; i < pr.length; i++){
        p = pr[i].split('=');
        if(p.length === 2){
            if( p[0].trim() === '' ) continue;
            _result.properties[p[0].trim()] = p[1].trim();
        }
    }
	
	// Define tag name, id, class and child UI using regular expressions.
    _result.tag     = str.match(Settings.regexp_tagName);
    _result.id      = str.match(Settings.regexp_id);
    _result.class   = str.match(Settings.regexp_class);
    _result.child   = str.match(Settings.regexp_childUI);
	_result.include = str.match(Settings.regexp_include);

    // Cut special characters from the start.
    if(_result.tag     !== null) _result.tag     = _result.tag[0].slice(1).trim();
    if(_result.id      !== null) _result.id      = _result.id[0].slice(1).trim();
    if(_result.class   !== null) _result.class   = _result.class[0].slice(1).trim();
    if(_result.child   !== null) _result.child   = _result.child[0].slice(1).trim();
    if(_result.include !== null) _result.include = _result.include[0].slice(3).trim();

    return _result;
}


/**
 * UI constructor.
 * @param scheme (object) - Scheme of the UI.
 * @param rules (object) - Additional rules for the UI elements. Has less priority on building process.
 */
function UI(options)
{
    if(typeof options !== 'object') options = {};

    // List of elements.
    this.elements = {};
    this.scheme   = options.hasOwnProperty('scheme') ? options.scheme : {};
    this.rules    = options.hasOwnProperty('rules') ? options.rules : {};
    this.prefix   = options.hasOwnProperty('prefix') ? options.prefix : '';
    this.name     = options.hasOwnProperty('name') ? options.name : '';
    this.css      = options.hasOwnProperty('css') ? options.css : null;
	
	if(this.css === null && options.hasOwnProperty('styles')){
		this.css = options.styles;
	}
	
	this.cssLoaded = false;
	
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value : {},
		configurable : false,
		enumerable : false,
		writeable : false
	});
	
	this.__.events = {};
	this.__.styleNode = null;
	this.__.data = options.hasOwnProperty('data') ? options.data : null;
	this.__.url = null;
	
	// Parameters to be used on rendering.
	this.__.params = options.hasOwnProperty('parameters') ? options.parameters : {};

    if(typeof this.scheme !== 'object') 
        throw new InvalidSchemeException('Scheme must be an object. ' + typeof this.scheme + ' given.');

    // Clone all elements from scheme to 'elements' object.
    try{
        cloneSchemeLinear(this.scheme, this.elements);
    }catch(e){
        error(e);
    }
	
	for(var p in options){
		if( p.slice(0, 2) === 'on' && typeof options[p] === 'function' ){
			this.addEventListener(p.slice(2), options[p]);
		}
	}
}
UI.prototype = {constructor : UI};


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
 */
function buildScheme(instance, ui, scheme, target, atStart)
{
    // Set default atStart value if it's not specified.
    if(typeof atStart !== 'boolean') atStart = false;

    // Throw error if instance is not exemplar of the UIInstance.
    if(instance instanceof UIInstance === false) 
        throw new RenderingException('Second argument must be an UIInstance.');

    // Throw error if ui is not exemplar of the UI.
    if(ui instanceof UI === false) 
        throw new RenderingException('Second argument must be an UI.');

    var params;     // Parameters of the single element (UIElement).
    var targetNode; // Node in which element will be placed.

    if(typeof scheme === 'object'){
        for(var elementName in scheme){

            // Skip if element with the same name already exists.
            if( instance.hasOwnProperty(elementName) ) continue;

            // Parse parameters for new element.
            if(typeof scheme[elementName] === 'string'){
                params = parseParameters(scheme[elementName]);
            }else if(typeof scheme[elementName] === 'object'){
                if( ui.rules.hasOwnProperty(elementName) ){
                    params = parseParameters(ui.rules[elementName]);
                }else{
                    params = {
                        id         : null,
                        class      : makeClassName(elementName),
                        tag        : 'div',
                        child      : null,
                        include    : null,
                        attributes : {},
                        properties : {}
                    };
                } 
            }
			
			// Make default class if not set.
            if(params.class === '' || params.class === null){
				params.class = makeClassName(elementName);
			}
			
			var uiClass = makeClassName(ui.name.replace(' ', ','));
			if(ui.scheme === scheme && params.class !== uiClass){
				params.class = uiClass + ' ' + params.class;
			}
			
            params.name = elementName;

			// Create element.
			var element = new UIElement(params);
			element.__.uiinstance = instance;
			element.__.node.uiinstance = instance;
			
			// Render another UI if include is detected.
			if(params.include !== null){
				
				if( uilist.hasOwnProperty(params.include) ){
					element.__.inclusion = element.add(uilist[params.include]);
				}else{
					throw new RenderingException('Required for including UI "' + params.include + '" is not registered yet.');
				}
				
			}
			
            // Attach element into instance.
            instance[elementName] = element;

            // Set parent UIElement and define target node.
            if(target instanceof UIElement){
                element.__.parent = target;
				target[elementName] = element;
                targetNode = target.__.node;
            }else if(typeof target === 'string'){
				targetNode = document.querySelector(target);
			}else{
                targetNode = target;
            }


			// Append element to the container node.
			if(atStart){
				var first = targetNode.firstChild;
				if(first !== null){
					targetNode.insertBefore(element.__.node, first);
				}else{
					targetNode.appendChild(element.__.node);
				}
			}else{
				targetNode.appendChild(element.__.node);
			}
			
			// Add nested schemes.
			if(typeof scheme[elementName] === 'object'){
				for(var p in scheme[elementName]){
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
 * @param {bool} atStart - if true, builds UI into start of the list (default - false)
 * @return {UIInstance}
 **/
UI.prototype.renderTo = function(container, atStart, params)
{
    var instance = new UIInstance(); // Create new UI instance.

    instance.__.ui = this; // Set ui property.

	// Set params if atStart flag is missing.
	if(typeof atStart === 'object' && typeof params !== 'object') params = atStart; 
	
    // Set flag if instance should be built at the start or at the end.
    if(atStart !== true) atStart = false;

	
    // If we render UI into the UIElement of another UIInstance - make necessary links.
    if(container instanceof UIElement){
        instance.__.parent = container;       // Set parent element for newly created instance.
        container.__.children.push(instance); // Add instance to the children list of the container.
    }
	
    // Build scheme recursively.
	try{
		buildScheme(instance, this, this.scheme, container, atStart);
	}catch(e){
		error(e);
	}

	// Create <style/> tag if css property specified and styles are not loaded yet.
	if( !this.cssLoaded && this.css !== null){
		
		var cssText = '';
		
		// Compose styles.
		for(var elName in this.css){
			
			var elStyles = this.css[elName];
			
			// Check if element exists in the UI.
			if( !instance.hasOwnProperty(elName) ){
				
				// At symbol at the start indicate abot media query or animation, so use it as is.
				if(elName[0] === '@'){
					
					cssText += elName + "{\n";
					// Loop through css properties.
					for(var p in elStyles){
						
						if(typeof elStyles[p] === 'string'){
							cssText += '    ' + makeClassName(p) + ': ' + elStyles[p] + ";\n";
						}else if(typeof elStyles[p] === 'object'){
							value = '    ' + p + " {\n";
							for(var s in elStyles[p]){
								value += '        ' + makeClassName(s) + ': ' + elStyles[p][s] + ";\n";
							}
							value += "    }\n";
							cssText += value;
						}
						
					}
					cssText += "}\n";
					
					continue;
				}else{
					warn('Rendering error. Style target "' + elName + '" is absent in the "' + this.name + '" UI.');
					continue;
				}
				
			}
			
			
			var el = instance[elName];
			
			// Define css selector of the element.
			var selector = el.__.id !== null ? '#' + el.__.id : '.' + el.__.class.split(' ').join('.');
			
			// If selector contains class - complement it with parent class.
			if(selector[0] === '.'){
				var topParent = el.findTopLocalParent();
				if(topParent !== null){
					selector = (topParent.__.id !== null ? '#' + topParent.__.id : '.' + topParent.__.class.split(' ').join('.')) + ' ' + selector;
				}
			}
			cssText += selector + "{\n";
			// Loop through css properties.
			for(var p in elStyles){
				if(p[0] === '.' || p[0] === ':' || p[0] === ' '){
					continue;
				}
				cssText += '    ' + makeClassName(p) + ': ' + elStyles[p] + ";\n";
			}
			cssText += "}\n";
			
			// Process included styles.
			for(var p in elStyles){
				var sel = selector;
				if(typeof elStyles[p] !== 'object') continue;
				if(p[0] === '.' || p[0] === ':' || p[0] === ' '){
					sel += p;
				}else{
					continue;
				}
				
				cssText += sel + "{\n";
				for(var prop in elStyles[p]){
					cssText += '    ' + makeClassName(prop) + ': ' + elStyles[p][prop] + ";\n";
				}
				cssText += "}\n";
			}
		}
		
		var head  = document.getElementsByTagName('head')[0];
		var styleTag  = document.createElement('style');
		styleTag.innerHTML = cssText;
		
		// Add comment if logging is enabled.
		if(Settings.logging){
			var comment = document.createComment('--- ' + this.name + ' ---');
			head.appendChild(comment);
		}
		
		head.appendChild(styleTag);
		this.cssLoaded = true;
	}
	
	if(typeof params !== 'object') params = {};
	for(var p in this.__.params){
		if( !params.hasOwnProperty(p) ) params[p] = this.__.params[p];
	}
	
	instance.__.params = params;
	
	// Run "onrender" action if specified.
	if(typeof this.onrender === 'function'){
		this.onrender(instance, params);
	}
	
	// Trigger 'render' event.
    this.triggerEvent('render', instance, params);

    return instance;
};










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
function register(data)
{
    if( !data.hasOwnProperty('name') ) 
        throw new UIRegistrationException('Name of a new UI is not defined.');
    
    if( typeof data.name !== 'string' )
        throw new UIRegistrationException('Name of a new UI is ' + (typeof data.rules) + '. String required.');

    if( uilist.hasOwnProperty(data.name) ) 
        throw new UIRegistrationException('UI with name "' + data.name + '" already registered.');

    if(!data.hasOwnProperty('scheme'))
        throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" absent.');
	
	if(typeof data.scheme !== 'object')
        throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" is ' + (typeof data.scheme) + '. Object required.');

    if( !data.hasOwnProperty('rules') ) data.rules = {};

    if(typeof data.rules !== 'object')
        throw new UIRegistrationException('Rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');

    uilist[data.name] = new UI(data);
	_uibuilder.triggerEvent('register', uilist[data.name]);
}
_uibuilder.register = register;














//           UIInstance
// ___________________________
// ---------------------------



/* Constructor of the UI instance */
function UIInstance()
{	
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value : {},
		configurable : false,
		enumerable : false,
		writeable : false
	});
	
	this.__.events = {};
	this.__.ui = null;
	this.__.parent = null;
	this.__.data = null;
	this.__.params = {};
}

UIInstance.prototype = {constructor : UIInstance};

// Add events supporting for UIInstance.
addEventsImplementation.call(UIInstance.prototype);


/**
 * Removes UIInstance from the parent UIElement.
 */
UIInstance.prototype.remove = function()
{
    // remove this instance from the parent children[] property
    var parent = this.__.parent;
    var scheme = this.__.ui.scheme;
    

    for(var p in scheme){
		if(this[p].__.node.parentNode !== null)
			this[p].__.node.parentNode.removeChild(this[p].__.node);
	}

    if(parent instanceof UIElement !== true) return;

    for(var i = 0, len = parent.__.children.length; i < len; i++)
    {
        if(parent.__.children[i] === this){
            parent.__.children.splice(i, 1);
            break;
        }
    }
};


/**
 * Returns parent UIInstance.
 * @return UIInstance|null
 */
UIInstance.prototype.parentUII = function()
{
    var parent = this.__.parent;
    if(parent instanceof UIElement) return parent.__.uiinstance;
    return null;
};


/**
 * Loads data to the instance.
 * @param {object} data 		Data to be loaded.
 * @param {boolean} replace		If true all existing data will be removed before loading.
 * @param {boolean} atStart		If true new data will be inserted into the start.
 */
UIInstance.prototype.load = function(data, replace, atStart)
{
    if(typeof replace !== 'boolean') replace = true;
    if(typeof atStart !== 'boolean') atStart = false;

	if( data instanceof UIData ){

		try{
			data.fetch(function(replace, atStart, response){
				this.load(response, replace, atStart);
			}.bind(this, replace, atStart));
			return this;
		}catch(e){
			error(e);
		}
		
	}
	
    if( typeof data !== 'object')
        throw new UIInstanceLoadException('Invalid argument. Object is required but ' + typeof data + ' given.');

	if(Array.isArray(data)){
		var root = this.getRootElement();
		if(root !== null) {
			root.load(data);
			return this;
		}
	}
	
	
    for(var p in data)
    {
        if(p === 'ui' || p === 'parent') continue; // Prevent from changing some initial properties.
		
        if( this.hasOwnProperty(p) && this[p] instanceof UIElement){
			
			var el = this[p];
			var inclusion = el.inclusion(); // Included UIInstance
			
			if( inclusion instanceof UIInstance ){
				
				if( Array.isArray(data[p]) ){
					var root = inclusion.getRootElement();
					if(root === null) throw new UIInstanceLoadException('Root element is absent for loading array of data.');
					try{
						root.load(data[p]);
					}catch(e){
						error(e);
					}
				}else{
					inclusion.load(data[p]);
				}
				
				
			}else{
				try{
					this[p].load(data[p], replace, atStart);
				}catch(e){
					error(e);
				}
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
UIInstance.prototype.getRootElement = function()
{
	var topLevel = Object.keys(this.__.ui.scheme);
	return topLevel.length === 1 && this.hasOwnProperty(topLevel[0]) ? this[topLevel[0]] : null;
}








//          UIElement
// ___________________________
// ---------------------------


/**
 * Constructor of the elements that UIInstance contains within.
 * @param {object} params
 * @constructor
 */
function UIElement(params)
{
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value : {},
		configurable : false,
		enumerable : false,
		writeable : false
	});
	
    // set parameters
    this.__.name    = params.name !== undefined ? params.name : null;
    this.__.child   = params.child !== undefined ? params.child : null; // string or null
    this.__.inclusion  = null;
    this.__.class   = params.class !== undefined ? params.class : null  // string or null
    this.__.id      = params.id !== undefined ? params.id : null        // string or null
    this.__.tag     = params.tag !== null && params.tag !== undefined ? params.tag.toLowerCase() : 'div';

    // Create node.
    if(this.__.tag === '') this.__.tag = 'div';
    this.__.node  = document.createElement(this.__.tag);
    this.__.parent = null;
    this.__.uiinstance = null;
    this.__.node.uiinstance = null;
    this.__.node.uielement = this;
	
	// Set data collector.
	this.__.data = params.data === undefined ? null : params.data;
	
	// Children is an array for the instances of child UI (defined in the scheme as '|item' for example).
	// Do NOT add single child elements or other.
    this.__.children = [];

    // Events handlers container.
    this.__.events = {};


    // Attach attributes.
    for(var p in params.attributes){
        this.__.node.setAttribute(p, params.attributes[p]);
    }
    // Set properties.
    for(var p in params.properties){
		
		// Use prototype method if available.
        if( UIElement.prototype.hasOwnProperty(p) && typeof UIElement.prototype[p] === 'function'){
            UIElement.prototype[p].call(this, params.properties[p]);
			
		// Otherwise set node properties directly.
        }else{
			this.__.node[p] = params.properties[p];
		}
    
    }

    // set class and id
    if(typeof this.__.class === 'string') this.__.node.className = this.__.class;
    if(typeof this.__.id    === 'string') this.__.node.id = this.__.id;
}
UIElement.prototype = {constructor : UIElement};


/**
 * Checks if element has child UI.
 * @return {boolean}
 */
UIElement.prototype.hasChildUI = function()
{
	return this.__.child !== null;
};

/**
 * Checks if element includes another ui instance.
 * @return {boolean}
 */
UIElement.prototype.hasInclusion = function()
{
	return this.__.inclusion !== null 
		&& this.__.children.length === 1 
		&& this.__.children[0] instanceof UIInstance;
};


/**
 * Finds parent element (UIElement) inside own UIInstance.
 * If element has no local parent null will be returned.
 * @return {UIElement|null}
 */
UIElement.prototype.findTopLocalParent = function()
{
	var p = this;
	while(p instanceof UIElement)
	{
		if(p.__.parent === null) break;
		if(p.__.parent instanceof UIElement && p.__.parent.__.uiinstance === this.__.uiinstance){
			p = p.__.parent;
		}else{
			break;
		}
	}
	
	if(p === this) return null;
	return p;
}


UIElement.prototype.inclusion = function()
{
	return this.__.inclusion;
};


UIElement.prototype.UII = function()
{
	return this.__.uiinstance;
};


UIElement.prototype.parent = function()
{
	return this.__.parent;
};


UIElement.prototype.parentUII = function()
{
	return this.UII() === null ? null : this.UII().parentUII();
};

UIElement.prototype.children = function()
{
	return this.__.children;
};


var nativeEvents = ['abort', 'beforeinput',	'blur',	'click', 'compositionen', 
	'compositionstart', 'compositionupdate', 'dblclick', 'error', 'focus', 
	'focusin', 'focusout', 'input',	'keydown', 'keypress', 'keyup',	'load',	
	'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 
	'mouseup', 'resize',	'scroll', 'select',	'unload', 'wheel'
];

/**
 * Implements specific events stystem.
 * UIElements need to handle native JS events so 
 * do NOT use addEventsImplementation for UIElement!
 */
UIElement.prototype.addEventListener = function(eventName, callback)
{
    if(eventName.slice(0,2) === 'on') eventName = eventName.slice(2);
    if( !this.__.events.hasOwnProperty(eventName) ) this.__.events[eventName] = [];
	
	// Exit if handler is already added.
    if(this.__.events[eventName].indexOf(callback) >= 0){
		warn('Handler for the event "' + eventName + '" already added.');
		return this;
	}
	
    this.__.events[eventName].push(callback);
	
	if( nativeEvents.indexOf(eventName) >= 0 ){
		this.__.node.addEventListener(eventName, runUIElementHandlers);
	}
	
	return this;
};

UIElement.prototype.on = UIElement.prototype.addEventListener;


UIElement.prototype.removeEventListener = function(eventName, callback)
{
	if(eventName.slice(0,2) === 'on') eventName = eventName.slice(2);
	if( !this.__.events.hasOwnProperty(eventName) ) return this;
	
	var index = this.__.events[eventName].indexOf(callback);
	if(index < 0) return this;
	this.__.events[eventName].splice(index, 1);
	return this;
};

UIElement.prototype.removeAllEventListeners = function(eventName)
{
	if(eventName.slice(0,2) === 'on') eventName = eventName.slice(2);
	if( !this.__.events.hasOwnProperty(eventName) ) return this;
	this.__.events[eventName] = null;
	delete this.__.events[eventName];
	this.__.node.removeEventListener(eventName, runUIElementHandlers);
	return this;
};

UIElement.prototype.off = function(eventName, callback)
{
	if(callback !== undefined){
		this.removeEventHandler(eventName, callback);
	}else{
		this.removeAllEventListeners(eventName);
	}
	return this;
};


UIElement.prototype.triggerEvent = function(eventName)
{
	if(eventName.slice(0,2) === 'on') eventName = eventName.slice(2);
	if( !this.__.events.hasOwnProperty(eventName) ) return this;
	
	var handlers = this.__.events[eventName];
    for(var i = 0; i < handlers.length; i++){
        handlers[i].call(this, this.__.uiinstance);
    }
};

function runUIElementHandlers(e){
    var handlers = this.uielement.__.events[e.type];
    for(var i = 0; i < handlers.length; i++){
        handlers[i].call(this.uielement, this.uiinstance, e);
    }
};


/**
 * Removes all children.
 */
UIElement.prototype.removeChildren = function(){
    for(var i = 0, len = this.__.children.length; i < len; i++){
        this.__.children[0].remove();
    }
    this.__.children = [];
};



/**
 * Removes UIElement instance from the parent.
 */
UIElement.prototype.remove = function()
{
    delete this.__.node.uiinstance[this.name];
    this.__.node.parentNode.removeChild(this.__.node);
};



/**
 * 
 * @param ui      (UI)   - UI that will be built into UIElement
 * @param atStart (bool) - If true, builds UI at the start of the list
 * @returns {UIInstance} - New instance of the UI, that was appended to the UIElement.node
 */
UIElement.prototype.addOne = function(atStart)
{
    if(atStart === undefined || atStart === null) atStart = false;
    if(this.__.child === null) return null;
    var ui = _uibuilder(this.__.child);
    if(ui === null) return null;
    return this.add(ui, atStart);
};


/**
 * Renders UI inside element (itself).
 * @param {UI|string} ui
 * @param {boolean} atStart if true new elements will be added at start. Default is false.
 * @return {UIInstance}
 */
UIElement.prototype.add = function(ui, atStart)
{
    if(atStart === undefined || atStart === null) atStart = false;
	
	if(typeof ui === 'string'){
		if( uilist.hasOwnProperty(ui) ){
			ui = uilist[ui];
		}else{
			throw new InvalidParamException('UI with name ' + ui + ' is absent.');
		}
	}
	
	if(!ui instanceof UI){
		throw new InvalidParamException('First argument of the add() method must be UI or string');
	}
	
    var instance = ui.renderTo(this, atStart);

    if(atStart && this.__.children.length > 0){
        this.__.children.unshift(instance);
    }else{
        this.__.children.push(instance);
    }
    instance.__.parent = this;
    return instance;
};




/**
 * Functions to manage properties like in jQuery but working
 * with UIElement instances.
 */
UIElement.prototype.html = function(html)
{
    if(html === undefined) return this.__.node.innerHTML;
    this.__.node.innerHTML = html;
	return this;
};
UIElement.prototype.text = function(text)
{
    if(text === undefined) return this.__.node.innerTex;
    this.__.node.innerTex = text;
	return this;
};
UIElement.prototype.attr = function(name, value)
{
    if(value === undefined) return this.__.node.getAttribute(name);
    this.__.node.setAttribute(name, value);
	return this;
};
UIElement.prototype.prop = function(name, value)
{
    if(value === undefined) return this.__.node[name];
    this.__.node[name] = value;
	return this;
};
UIElement.prototype.val = function(val)
{
    if(val === undefined) return this.__.node.value;
    this.__.node.value = val;
	return this;
};
UIElement.prototype.src = function(val)
{
    if(val === undefined) return this.__.node.src;
    this.__.node.src = val;
	return this;
};
UIElement.prototype.href = function(val)
{
    if(val === undefined) return this.__.node.href;
    this.__.node.href = val;
	return this;
};
UIElement.prototype.getContext = function(val)
{
    if(val === undefined) return this.__.node.getContext('2d');
    return this.__.node.getContext(val);
};
UIElement.prototype.width = function(val)
{
    if(val === undefined) return this.__.node.width;
    this.__.node.width = val;
	return this;
};
UIElement.prototype.height = function(val)
{
    if(val === undefined) return this.__.node.height;
    this.__.node.height = val;
	return this;
};
UIElement.prototype.hide = function(animation, duration)
{
    if(this.__.node.style.display === 'none') return this;
    this.__.node.oldDisplay = this.__.node.style.display;
    this.__.node.style.display = 'none';
	return this;
};
UIElement.prototype.show = function()
{
    if(this.__.node.style.display !== 'none' && this.__.node.offsetParent !== null) return this;
    if(this.__.node.hasOwnProperty('oldDisplay') && this.__.node.oldDisplay !== 'none'){
        this.__.node.style.display = this.__.node.oldDisplay;
    }else{
        this.__.node.style.display = 'flex';
    }
	return this;
};


UIElement.prototype.hasClass = function(className)
{
    return this.__.node.classList.contains(className);
};


UIElement.prototype.addClass = function(className)
{
    if(typeof className === 'string'){
        this.__.node.classList.add(className);
    }else if(Array.isArray(className)){
		for(var i = 0; i < className.length; i++)
		{
			this.__.node.classList.add(className[i]);
		}
    }else{
        return this;
    }

	this.__.class = this.__.node.className;
    return this;
};


UIElement.prototype.removeClass = function(className)
{
    var arr = [];
    if(typeof className === 'string'){
        this.__.node.classList.remove(className);
    }else if(Array.isArray(className)){
        for(var i = 0; i < className.length; i++)
		{
			this.__.node.classList.remove(className[i]);
		}
    }else{
        return this;
    }

	this.__.class = this.__.node.className;
    return this;
};


UIElement.prototype.toggleClass = function(className)
{
	this.__.node.classList.toggle(className);
	this.__.class = this.__.node.className;
	return this;
}


UIElement.prototype.css = function(style)
{
    for(var p in style){
        this.__.node.style[p] = style[p];
    }
	return this;
};


UIElement.prototype.clientRect = function()
{
	return this.__.node.getBoundingClientRect();
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
UIElement.prototype.load = function(data, replace, atStart)
{
	// Set default values.
    if(typeof replace !== 'boolean') replace = true;
    if(typeof atStart !== 'boolean') atStart = false;

	
	// If UIData (data provider) is given through "data" argument 
	// use fetch() method and then load given data using load() method.
    if( data instanceof UIData ){

        return data.fetch(function(replace, atStart, response){
            this.load(response, replace, atStart);
        }.bind(this, replace, atStart));
		
	}else{
		
		var deleteContent = false;
		if(typeof data === 'object' && !Array.isArray(data)){
			for(var p in data){
				if(!UIElement.prototype.hasOwnProperty(p)){
					deleteContent = true;
					break;
				}
			}
		}
		// Remove all children if "replace" argument is true.
		if(replace === true && deleteContent){
			this.removeChildren();
			this.html('');
		}
	}

	// If data is string - use is as innerHTML (for <img/> "src" attribute will be used).
    if( typeof data === 'string' ){

		
			
        if( this.__.tag === 'img' ){
            this.src(data);
        }else{
            this.html(data);
        }
        
    }else if(typeof data === 'object'){

		// If array given - render child UI for each array element and load it into new instance.
        if(Array.isArray(data) ){

            if( this.__.child === null) {
                throw new UIElementLoadException('Trying to load children for UIElement "' + this.__.name + '" without child UI.');
			}

            var child;
            for(var i = 0; i < data.length; i++){
                try{
                    child = this.addOne(atStart);
                    child.load(data[i], replace, atStart);
                }catch(exception){
					// Re-throw exception up.
                    throw exception;
                }   
            }

		// If data is object - load it into the child elements or use as properties of the current.
        }else{

            for(var p in data){
				
				// Load children ...
                if( p === 'children' && Array.isArray(data[p]) && this.hasChildUI()){
                    this.load(data[p], replace, atStart);
					
				// ... or execute prototype method ...
                }else if( UIElement.prototype.hasOwnProperty(p)  && typeof UIElement.prototype[p] === 'function'){
                    UIElement.prototype[p].call(this, data[p]);
					
				// ... otherwise render new UI.
                }else{
                    if(uilist.hasOwnProperty(p)){
						uilist[p].renderTo(this).load(data[p]);
					}
                }
            }

        }

    }else{
        throw new UIElementLoadException('Unsupported data type given (' + typeof data + '). Only string or object can be used.');
    }
	return this;
};






//       Data collectors
// ___________________________
// ---------------------------


/**
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
function defaultCollector(callback)
{
    if(typeof callback !== 'function') this.triggerEvent('error');
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
function ajaxCollector(callback)
{
	if(typeof callback !== 'function'){
		this.triggerEvent('error');
		error('Callback for the ajaxCollector is not a function (' + typeof callback + ' given).');
		return false;
	}
	
    if(typeof this.url !== 'string'){
		this.triggerEvent('error');
		error('URL for the ajaxCollector is not a string (' + typeof this.url + ' given).');
		return false;
	}
	
    var _uidata = this;

    var xhttp = new XMLHttpRequest();
	
	var _this = this;
	xhttp.onprogress = function(e){
		if (e.lengthComputable) {
			_uidata.triggerEvent('progress', Math.ceil(e.loaded / e.total * 100));
		}
	};
	
    xhttp.onreadystatechange = function()
	{
        if (this.readyState != 4) return;

        if(this.status == 200) {
			
			// Make redirection if X-Redirect header is specified.
			var url = this.getResponseHeader('X-Redirect');
			if(url !== null){
				window.location.replace(url);
			}else{
				_uidata.triggerEvent('error', this.status);
			}
			
            // Get data depending on content-type header.
            var data;
            var contentType = this.getResponseHeader("content-type");
            if( typeof contentType === 'string' && contentType .indexOf('json') >= 0){
                data = JSON.parse(this.responseText);
            }else{
                data = this.responseText;
            }
			_uidata.triggerEvent('dataready', data);
			_uidata.triggerEvent('progress', 100);
            _uidata.cache = _uidata.cacheLifitime === null || _uidata.cacheLifitime > 0 ? data : null;
            if(typeof callback === 'function') callback(data, _uidata);
		
		}else{
            _uidata.triggerEvent('error', this.status);
        }
        _uidata.lastFetchTime = Date.now();
        _uidata.ready = true;
    };
	
    xhttp.open(this.method, this.url, true);
	
	// Set header that indicates that request was made by AJAX.
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	
	if(this.method.toUpperCase() === 'POST'){
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		var data = [];
		for(var p in this._parameters){
			data.push(encodeURIComponent(p) + '=' + encodeURIComponent(this._parameters[p]));
		}
		xhttp.send(data.join('&'));
	}else{
		xhttp.send();
	}
	
	return true;
}





//       Data providers
// ___________________________
// ---------------------------


/**
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
function UIData(params)
{
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value : {},
		configurable : false,
		enumerable : false,
		writeable : false
	});
	
	this.__.events = {};
	
    this.ready = true;         // Flag if UIData is ready to fetching.
    this.cache = null;         // Data got by last fetch.
    this.cacheLifetime = null; // Lifetime of cache
	this.allowMultiple = true;
	
    // Set the collector.
    if( params.hasOwnProperty('collector') ){
        if( typeof params.collector !== 'function' )
            throw new UIDataException('Collector must be a function but ' + typeof params.collector + ' given.');
        this.collector = params.collector;
    }else{
        this.collector === defaultCollector;
    }

    this.waitingLimit = params.hasOwnProperty('waitingTime') ? intval(params.waitingTime) : 3000;
    this.timeElapsed = 0;
    
    this.lastFetchTime = Date.now();
    this._parameters = params.hasOwnProperty('parameters') ? intval(params.parameters) : {};
}
UIData.prototype = {constructor : UIData};

UIData.prototype.parameters = function(parameters)
{
    this._parameters = parameters;
    return this;
};


/**
 * Fethces data by executing collector.
 */
UIData.prototype.fetch = function(callback)
{
	this.triggerEvent('fetch');
    if(typeof params === 'object') this.params = params;
    if( (this.allowMultiple || this.ready) && typeof this.collector === 'function'){
        this.ready = false;
        return this.collector(callback);
    }
    return false;
};


// Add events to the UIData.
addEventsImplementation.call(UIData.prototype);



_uibuilder.UIData = UIData;





/**
 * Events are already implemented for UIData, so it's not necessary to add it here again.
 */
function UIDataAjax(params)
{
    UIData.call(this, params);
    this.url = params.hasOwnProperty('url') ? params.url : '';
	this.method = 'POST';
    this.collector = ajaxCollector;
}
UIDataAjax.prototype = Object.create(UIData.prototype);
UIDataAjax.prototype.constructor = UIData;


_uibuilder.UIDataAjax = UIDataAjax;









//       Animations
// ___________________________
// ---------------------------

/**
 * Animation is an object that changes properties of the elements
 * during period of the time.
 * 
 * This part of work will be done later :)
 */

function Animation()
{
	this.ready = true;
	this.duration = 250;
}

Animation.prototype = {constructor : Animation};

Animation.prototype.animate = function()
{
	
};


Animation.prototype.stop = function()
{
	
};







//       Routes
// ___________________________
// ---------------------------

/**
 * Routes are the objects that encapsulates app state of 
 * actions to apply app state.
 *
 * 
 */

function Route(options)
{
	if( !options.hasOwnProperty('path') ){
		throw new InvalidParamException('Route path is not specified.');
	}
	
	this.path = options.hasOwnProperty('path') ? options.path : null;
	
}


return _uibuilder;

})();




// Comment line below if you dont want to use pseudonym.
var UI = UIBuilder;
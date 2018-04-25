/**
 *             UI
 * ___________________________
 * ---------------------------
 
 * UI constructor.
 * @param options (object)
 * @method renderTo(container, [atStart], params)
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
	this.localization = options.hasOwnProperty('localization') ? options.localization : null;
	this.translations = options.hasOwnProperty('translations') ? options.translations : {};

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
 * Checks parameters that given on the UI registration.
 */
function checkUIParameters(data)
{
    if (!data.hasOwnProperty('name'))
        throw new UIRegistrationException('Name of a new UI is not defined.');

    if (typeof data.name !== 'string')
        throw new UIRegistrationException('Name of a new UI is ' + (typeof data.name) + '. String required.');

    if (uiList.hasOwnProperty(data.name))
        throw new UIRegistrationException('UI with name "' + data.name + '" already registered.');

    if (!data.hasOwnProperty('scheme')) data.scheme = {};

    if (typeof data.scheme !== 'object')
        throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" is ' + (typeof data.scheme) + '. Object required.');

    if (!data.hasOwnProperty('rules')) data.rules = {};

    if (typeof data.rules !== 'object')
        throw new UIRegistrationException('Rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');
}


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

			}else if(scheme[p] === false){
                delete scheme[p];
            } else {
				throw new InvalidSchemeException('Value of the element must be string or object.');
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
				var inclusionUI = _uibuilder(params.include);
				if (inclusionUI !== null) {
					for(var p in inclusionUI.__.params){
						if(!params.parameters.hasOwnProperty(p)){
							params.parameters[p] = inclusionUI.__.params[p];
						}
					}
					element.__.inclusion = element.add(inclusionUI, params.parameters);
				} else {
					throw new RenderingException('Required for including UI "' + params.include + '" is not registered yet.');
				}
			}

            if( instance.__.localization !== null
                && instance.__.translations !== null
                && instance.__.translations.hasOwnProperty(element.__.name)
            ){
			    if(element.__.inclusion === null){
                    element.__.node.setAttribute('localization', instance.__.localization);
                    element.__.node.T = instance.__.translations[element.__.name];
                }else{
                    element.__.inclusion.triggerEvent('localization', instance.__.localization, instance.__.translations[element.__.name]);
                }
            }

			// Attach element into instance.
			instance[elementName] = element;

            if(ui.translations.hasOwnProperty(elementName)){
                var t = L10n.getTranslations(ui.localization);
                if(element.__.node.tagName === 'INPUT'){
                    element.attr('placeholder', t(ui.translations[elementName]));
                }else if(element.__.inclusion === null){
                    element.text(t(ui.translations[elementName]))
                }
            }

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
				for (p in scheme[elementName]) {
					buildScheme(instance, ui, scheme[elementName], element);
				}
			}
		}
	}
}


/**
 * Returns root element of the UI scheme.
 */
UI.prototype.getRootElement = function ()
{
	var topLevel = Object.keys(this.scheme);
	return topLevel.length === 1 ? this.elements[topLevel[0]] : null;
};


/**
 * Renders UI into the container.
 *
 * Example: UIBuilder('searchBar').renderTo('body');
 *
 * @param {node|string|UIElement} container - element in which UIInstance will be built
 * @param {boolean} [atStart] - if true, builds UI into start of the list (default - false)
 * @param {object} [params]
 * 
 * @event beforerender
 * @event render
 * 
 * @return {UIInstance}
 **/
UI.prototype.renderTo = function (container, atStart, params)
{
	// Lets allow users to modify rendering options during 'beforeRender' event.
	var options = {
	    container : container,
        atStart : atStart,
        params : params,
        localization : this.localization,
        translations : Object.assign({}, this.translations)
	};
	this.triggerEvent('beforeRender', options);

	// Apply changing.
	container = options.container;
	atStart = options.atStart;
	params = options.params;


	var instance = new this.uiiConstructor(); // Create new UI instance.

	instance.__.ui = this; // Set UI property.
    instance.__.localization = options.localization;
    instance.__.translations = options.translations;

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


	// Filter given parameters.
	if (typeof params !== 'object') params = {};
	for(var p in params){
		if(params.hasOwnProperty(p)){
			params[p] = filterUIParameterValue(params[p]);
		}
	}
	
	// Append default parameters that absent in the given by user.
	for (var p in this.__.params) {
		if ( ! params.hasOwnProperty(p) ){
			params[p] = this.__.params[p];
		}
	}

	instance.__.params = params;

	// Trigger 'render' event.
	var event = new UIEvent('render');
	event.target = this;
	this.triggerEvent('render', instance, params, event);

	return instance;
};


/**
 * Renders UI to the <body/>.
 * @param params
 */
UI.prototype.render = function (params) {
    return this.renderTo('body', params);
};


/**
 * Filters UI parameter:
 * - converts 'true' or 'false' to corresponding boolean value.
 * - converts 'null' to null value.
 * - parses string with numbers to the corresponding number value.
 */
function filterUIParameterValue(value)
{
	var numberRegexp = /^\d+(\.?\d+)?$/i;
	
	if(value === 'null'){
		value = null;
	}else if(value === 'true'){
		value = true;
	}else if(value === 'false'){
		value = false;
	}else if(numberRegexp.test(value)){
		value = Number(value);
	}
	
	return value;
}


/**
 * Generates CSS of the UI.
 * @return {string}
 */
UI.prototype.generateCSS = function(data, parentSelector, parentEl)
{
	if(parentSelector === undefined) parentSelector = '';
	var res = [];

	for(var elName in data)
	{
		var styles = data[elName];
		var cssText = '';
		var selector, params;

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
			params = parseParameters(this.elements[elName].rules);
			selector = params.id !== null ? '#' + params.id : '.' + (params.class !== null ? params.class.split(' ').join('.') : makeClassName(elName));
			selector = (this.elements.hasOwnProperty(parentEl) && this.elements[parentEl].children.hasOwnProperty(elName) ? ' > ' : ' ') + selector;
		}else{
			selector = makeClassName(elName);
		}

		// Make root selector to encapsulate styles in the instance UI.
		var rootSelector = makeClassName(this.name);
		var root = this.getRootElement();
		if(root !== null){
			params = parseParameters(root.rules);
			var rootClass = params.class !== null ? params.class.split(' ').join('.') : makeClassName(root.name);
			if(root === this.elements[elName]){
				selector = '';
			}
			rootSelector = params.id !== null ? '#' + params.id : '.' + makeClassName(this.name) + '.' + rootClass;
		}
		// Don't use root selector if it already presented.
		if(parentSelector.indexOf(rootSelector) >= 0 || selector.indexOf(rootSelector) >= 0) rootSelector = '';

		var index = res.length;
		res.push('');

		cssText += ((rootSelector + ' ' + parentSelector).trim() + selector)
                .replace('  ', ' ')
                .replace(' :', ':')
                .replace('>:', ':') + "{\n"

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
				res.push(this.generateCSS(obj, parentSelector + selector, elName));
			}
		}
		cssText += "}\n";
		res[index] = cssText;
	}
	return res.join("\n");
};


/**
 * Generates CSS for the UI using [generageCSS()] method 
 * and appends it as new <style> tag.
 */
UI.prototype.createStyles = function()
{
	var head = document.getElementsByTagName('head')[0];
	var styleTag = document.createElement('style');
	styleTag.setAttribute('data-ui', this.name);
	styleTag.ui = this;
	styleTag.innerHTML = this.generateCSS(this.css);

	// Add comment if logging is enabled.
	// if (Settings.logging) {
	// 	var comment = document.createComment('--- ' + this.name + ' ---');
	// 	head.appendChild(comment);
	// }

	head.appendChild(styleTag);
	this.cssLoaded = true;
};




function UIExtending(extendingUI, extendedUIName, options)
{
    this.extendingUI = extendingUI;
    this.extendedUIName = extendedUIName;
    this.options = options;
}

UIExtending.prototype = {
    constructor: UIExtending,

    extend : function () {
        var extendedUI = _uibuilder(this.extendedUIName);
        if(extendedUI === null){
            throw new UIRegistrationException('UI "' + name + '" which be extended is not found.');
        }

        var extendingUI = this.extendingUI;
        var options = this.options;

        if(!options.hasOwnProperty('scheme')) options.scheme = {};
        if(!options.hasOwnProperty('rules')) options.rules = {};
        if(!options.hasOwnProperty('styles')) options.styles = {};
        if(!options.hasOwnProperty('translations')) options.translations = {};
        if(!options.hasOwnProperty('params')) options.params = {};

        extendingUI.uiiConstructor = extendedUI.uiiConstructor;
        extendingUI.elements = {};
        extendingUI.scheme = extendObject(options.scheme, cloneObject(extendedUI.scheme));
        extendingUI.rules = extendObject(options.rules, cloneObject(extendedUI.rules));
        extendingUI.translations = extendObject(options.translations, cloneObject(extendedUI.translations));
        extendingUI.css = extendObject(options.styles, cloneObject(extendedUI.css));
        extendingUI.params = extendObject(options.params, cloneObject(extendedUI.params));

        extendingUI.localization = options.hasOwnProperty('localization') ? options.localization : extendedUI.localization;

        extendingUI.cssLoaded = false;

        extendingUI.__.events = cloneObject(extendedUI.__.events);
        extendingUI.__.styleNode = null;
        extendingUI.__.data = options.hasOwnProperty('data') ? options.data : null;
        extendingUI.__.url = null;

        // Parameters to be used on rendering.
        if(options.hasOwnProperty('parameters')){
            extendingUI.__.params = extendObject(options.parameters, cloneObject(extendedUI.__.params));
        }else if(options.hasOwnProperty('params')){
            extendingUI.__.params = extendObject(options.params, cloneObject(extendedUI.__.params));
        }

        // Clone all elements from scheme to 'elements' object.
        try {
            cloneSchemeLinear(extendingUI.scheme, extendingUI.elements);
        } catch (e) {
            error(e);
        }

        for(var p in this.elements){
            if(extendingUI.rules.hasOwnProperty(p) && extendingUI.elements[p].rules === ''){
                extendingUI.elements[p].rules = extendingUI.rules[p];
            }
        }

        for (var p in options) {
            if (p.slice(0, 2) === 'on' && typeof options[p] === 'function') {
                extendingUI.addEventListener(p.slice(2), options[p]);
            }
        }
        return extendingUI;
    }
};



/**
 * Extends another UI.
 * @param name
 * @param options
 */
UI.prototype.extends = function (name, options)
{
    var extending = new UIExtending(this, name, options);
    delete uiList[this.name];
    uiExtendings[this.name] = extending;
};


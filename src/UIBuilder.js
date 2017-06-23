UIBuilder = (function()
{

var uilist = {};


function getByName(name)
{
    if(uilist.hasOwnProperty(name)) return uilist[name];
    return null;
}




_uibuilder = function(uiName)
{
    return getByName(uiName);
}















//         Exceptions
// ___________________________
// ---------------------------
//
// This section contains exceptions definition.
// Each new exception constructor should use base Exception constructor.
// Use log() function to print exception message in the "cache" section.
// Also you can use "name" property in your constructor that will be 
// printed after prefix and before main message.
//
// Usage example:
// 
// try{
//     if( earth === 'flat' ) throw new Exception('Some message...');
// }catch(error){ error.log(); }
// 

var LogPrefix = 'UIBuilder:';

/**
 * Base exception constructor with log() method.
 * @param message (string) - Message of the exception.
 */
function Exception(message)
{
    this.message = '';
}

Exception.prototype = {
    log : function()
    {
        if(this.message === '') return; // Exit if nothing to log.

        var message = LogPrefix; // Message to be printed into the log.

        if( this.hasOwnProperty('name') ) message += ' ' + this.name; // Add name if specified.
        message += ' ' + this.message; // Add message text.

        if( !this.hasOwnProperty('type') || this.type === 'Exception'){
            console.error(message);

        }else if(this.type === 'Warning'){
            console.warn(message);

        }else{
            console.log(message);
        }
    }
};


// Invalid options on UI registration.
function UIRegistrationException(message)
{
    Exception.call(this);
    this.name = 'UI Registration.';
}

// Exception about invalid scheme structure.
function InvalidSchemeException(message)
{
    Exception.call(this);
    this.name = 'Invalid scheme.';
}

// Error on building UI.
function BuildingProcessException(message)
{
    Exception.call(this);
    this.name = 'Can\'t build UI.';
}


// Error on setting parsing rule.
function InvalidParsingRuleException(message)
{
    Exception.call(this);
    this.name = 'Parsing rule setting.';
}


// Error on loading data to the UIInstance.
function UIILoadException(message)
{
    Exception.call(this);
    this.name = 'Instance data loading.';
}


// Error on loading data to the UIInstance.
function UIELoadException(message)
{
    Exception.call(this);
    this.name = 'Element data apply.';
}


// 
function UIDataException(message)
{
    Exception.call(this);
    this.name = 'UI Data.';
}














//         Settings
// ___________________________
// ---------------------------

var Settings = {
    regexp_id        : /#\w+[_-\w]*/ig,
    regexp_tagName   : /@\w+[_-\w]*/ig,
    regexp_class     : /\.\w+[_-\w\s]*/ig,
    regexp_attribute : /\[(\w+[_-\w]*=[^;=]+[_-\w\s]*(\s*;\s*)?)+\]/ig,
    regexp_property  : /\((\w+[_-\w]*=[^;=]+[_-\w\s]*(\s*;\s*)?)+\)/ig,
    regexp_childUI   : /\|\w+[_-\w]*/ig
};


/**
 * 
 */
_uibuilder.setParsingRule = function(subjectOrRules, RegularExpression)
{
    try{

        if(typeof subjectOrRules === 'string'){

            if( !Settings.hasOwnProperty('regexp_' + subjectOrRules) ) 
                throw InvalidParsingRuleException('Rule ' + subjectOrRules + ' is absent in the settings.');

            if(a.constructor !== RegExp) 
                throw InvalidParsingRuleException('Trying to assign ' + typeof RegularExpression + ' as parsing regular expression for ' + subjectOrRules + '.');
            
            Settings['regexp_' + parameters] = regExp;


        }else if(typeof subjectOrRules === 'object'){

            for(var p in subjectOrRules){

                if(Settings.hasOwnProperty('regexp_' + p)){
                    if(a.constructor !== RegExp) throw InvalidParsingRuleException('Trying to assign ' + typeof RegularExpression + ' as parsing regular expression for ' + subjectOrRules + '.');
                    Settings['regexp_' + p] = subjectOrRules[p];

                }else{
                    throw InvalidParsingRuleException('Rule ' +  p + ' is absent in the settings.');
                }
            }

        }

    }catch(exception){ exception.log(); }
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

    // Define tag name, id, class and child UI using regular expressions.
    _result.tag   = str.match(Settings.regexp_tagName);
    _result.id    = str.match(Settings.regexp_id);
    _result.class = str.match(Settings.regexp_class);
    _result.child = str.match(Settings.regexp_childUI);



    // Parse attributes.
    _result.attributes = {};

    // Get attributes array.
    var att = str.match(Settings.regexp_attribute);
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

    // Cut special characters from the start.
    if(_result.tag    !== null) _result.tag    = _result.tag[0].slice(1).trim();
    if(_result.id     !== null) _result.id     = _result.id[0].slice(1).trim();
    if(_result.class  !== null) _result.class  = _result.class[0].slice(1).trim();
    if(_result.child  !== null) _result.child  = _result.child[0].slice(1).trim();

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
    this.withEach = null;
    this.events = {};

    if(typeof this.scheme !== 'object') 
        throw new InvalidSchemeException('Scheme must be an object. ' + typeof this.scheme + ' given.');

    // Clone all elements from scheme to 'elements' object.
    try{
        cloneSchemeLinear(this.scheme, this.elements);
    }catch(exception){
        exception.log();
    }
}
UI.prototype = {constructor : UI};


/**
 * Adds event handler for the UI.
 * There are few events available:
 * - build
 * - destroy
 * - change
 * - unregister
 */
UI.prototype.addEventListener = function(eventName, handler)
{
    if(typeof handler !== 'function') 
        return console.warn(LogPrefix + ' ' + 'Trying to set non-function as event listener.');

    if( !this.events.hasOwnProperty(eventName) ) this.events[eventName] = [];
    if( this.events[eventName].indexOf(handler) >= 0 ) return;
    this.events[eventName].push(handler);
};


/**
 * Runs handlers for the specified event.
 * @param eventName (string)
 */
UI.prototype.triggerEvent = function(eventName, instance)
{
    if( !this.events.hasOwnProperty(eventName) ) return false;
    for(var i = 0; i < this.events[eventName].length; i++ ){
        if(typeof this.events[eventName][i] === 'function') 
            this.events[eventName][i].call(this, instance);
    };  
};


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
        throw new BuildingProcessException('Instance must be an UIInstance exemplar.');

    // Throw error if ui is not exemplar of the UI.
    if(ui instanceof UI === false) 
        throw new BuildingProcessException('"UI" argument must be an UI exemplar.');


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
                        class      : ui.name + '-' + elementName,
                        tag        : 'div',
                        child      : null,
                        attributes : {},
                        properties : {}
                    };
                } 
            }
            if(params.class === '' || params.class === null) params.class = ui.name + '-' + elementName,
            params.name = elementName;

            // Create element.
            var element = new UIElement(params);
            instance[elementName] = element;
            element.uiinstance = instance;
            element.node.uiinstance = instance;


            // Set parent UIElement and define target node.
            if(target instanceof UIElement){
                element.parent = target; 
                targetNode = target.node;
            }else{
                targetNode = target;
            }

            // Append element to the container node.
            if(atStart){
                var first = targetNode.firstChild;
                if(first !== null){
                    targetNode.insertBefore(element.node, first);
                }else{
                    targetNode.appendChild(element.node);
                }
            }else{
                targetNode.appendChild(element.node);
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
 * Builds instance of the UI into container.
 * @param container (node) - element in which UIInstance will be built
 * @param atStart   (bool) - if true, builds UI into start of the list (default - false)
 * Returns the instance of UI (UIInstance exemplar)
 **/
UI.prototype.build = function(container, atStart)
{
    var _instance = new UIInstance(); // Create new UI instance.

    _instance.ui = this; // Set ui property.

    // Set flag if instance should be built at the start or at the end.
    if(atStart === undefined || atStart === null) atStart = false;

    // If we build UI into the element of another UIInstance (UIElement) - make necessary links.
    if(container instanceof UIElement){
        _instance.parent = container;       // Set parent element for newly created instance.
        container.children.push(_instance); // Add instance to the children list of the container.
        container = container.node;         // Set node of the element as container in which UI will be built.
    }
    
    // Build scheme recursively.
    buildScheme(_instance, this, this.scheme, container, atStart);


    // Run withEach action if specified.
    if(typeof this.withEach === 'function') this.withEach.call(_instance);

    // Run onbuild event handlers.
    this.triggerEvent('build', _instance);

    return _instance;
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

    if( !data.hasOwnProperty('rules') ) data.rules = {};

    if(typeof data.rules !== 'object')
        throw new UIRegistrationException('Rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');

    uilist[data.name] = new UI(data);
}
_uibuilder.register = register;














//             UIInstance
// ___________________________
// ---------------------------



/* Constructor of the UI instance */
function UIInstance(){

}

UIInstance.prototype = {constructor : UIInstance};


UIInstance.prototype.remove = function()
{
    // removes this instance from the parent children[] property
    var parent = this.parent;
    var scheme = this.ui.scheme;
    

    for(var p in scheme) this[p].node.parentNode.removeChild(this[p].node);

    if(parent instanceof UIElement !== true) return;

    for(var i = 0, len = parent.children.length; i < len; i++)
    {
        if(parent.children[i] === this){
            parent.children.splice(i, 1);
            break;
        }
    }
};
UIInstance.prototype.parentUII = function()
{
    var parent = this.parent;
    if(parent instanceof UIElement) return parent.uiinstance;
    return null;
};
/**
 * Loads data to the instance.
 */
UIInstance.prototype.load = function(data, replace, atStart)
{
    if(typeof replace !== 'boolean') replace = true;
    if(typeof atStart !== 'boolean') atStart = false;

    if( !typeof data === 'object')
        throw new UIILoadException('Invalid argument. Object is required but ' + typeof data + ' given.');

    for(var p in data)
    {
        if(p === 'ui' || p === 'parent') continue; // Prevent to change some initial properties.
        if( this.hasOwnProperty(p) && this[p] instanceof UIElement) this[p].load(data[p], replace, atStart);
    }
};











//          UIElement
// ___________________________
// ---------------------------


/* Constructor of the elements that UIInstance contains within */
function UIElement(params)
{
    // set parameters
    this.name  = (params.name !== undefined) ? params.name : null;
    this.child = (params.child !== undefined) ? params.child : null; // string or null
    this.class = (params.class !== undefined) ? params.class : null  // string or null
    this.id    = (params.id !== undefined) ? params.id : null        // string or null
    this.tag   = (params.tag !== null && params.tag !== undefined) ? params.tag.toLowerCase() : 'div';

    // create node
    if(this.tag === '') this.tag = 'div';
    this.node  = document.createElement(this.tag);
    this.parent = null;
    this.uiinstance = null;
    this.node.uiinstance = null;
    this.node.uielement = this;
    this.children = [];

    /* events */
    this.events = {};


    // attach attributes
    for(var p in params.attributes){
        this.node.setAttribute(p, params.attributes[p]);
    }
    // ser properties
    for(var p in params.properties){
        if( UIElement.prototype.hasOwnProperty(p) && typeof UIElement.prototype[p] === 'function'){
            UIElement.prototype[p].call(this, params.properties[p]);
        }
        this.node[p] = params.properties[p];
    }

    // set class and id
    if(typeof this.class === 'string') this.node.className = this.class;
    if(typeof this.id    === 'string') this.node.id = this.id;
}
UIElement.prototype = {constructor : UIElement};


UIElement.prototype.addEventListener = function(eventName, callback)
{
    if(eventName.slice(0,2) !== 'on') eventName = 'on' + eventName;
    if(this.events[eventName] === undefined || this.events[eventName] === null) this.events[eventName] = [];
    if(this.events[eventName].indexOf(callback) >= 0) 
        return console.warn('Widgets: handler for the event "'+eventName+'" already added.');
    this.events[eventName].push(callback);
    this.node[eventName] = this.runEvent;
};

UIElement.prototype.runEvent = function(e){
    var handlers = this.uielement.events['on' + e.type];
    var uiinstance = this.uiinstance;
    for(var i = 0; i < handlers.length; i++){
        handlers[i].call(uiinstance, e);
    }
};

UIElement.prototype.removeChildren = function(){
    for(var i = 0, len = this.children.length; i < len; i++){
        this.children[0].remove();
    }
    this.children = [];
};

// removes this instance from the parent children[] property
UIElement.prototype.remove = function()
{
    delete this.node.uiinstance[this.name];
    this.node.parentNode.removeChild(this.node);
};



/**
 *
 * @param ui      (UI)   - UI that will be built into UIElement
 * @param atStart (bool) - If true, builds UI at the start of the list
 * @returns {UIInstance} - New instance of the UI, that was appended to the UIElement.node
 */
UIElement.prototype.addChild = function(atStart)
{
    if(atStart === undefined || atStart === null) atStart = false;
    if(this.child === null) return null;
    var ui = _uibuilder(this.child);
    if(ui === null) return null;
    return this.addOne(ui, atStart);
};



UIElement.prototype.addOne = function(ui, atStart)
{
    if(atStart === undefined || atStart === null) atStart = false;

    var uiInst = ui.build(this.node, atStart);

    if(atStart && this.children.length > 0){
        this.children.unshift(uiInst);
    }else{
        this.children.push(uiInst);
    }
    uiInst.parent = this;
    return uiInst;
};




/**
 * Functions to manage properties like in jQuery, but working
 * with UIElement instances.
 */
UIElement.prototype.html = function(html)
{
    if(html === undefined) return this.node.innerHTML;
    this.node.innerHTML = html;
};
UIElement.prototype.text = function(text)
{
    if(text === undefined) return this.node.innerTex;
    this.node.innerTex = text;
};
UIElement.prototype.attr = function(name, value)
{
    if(value === undefined) return this.node.getAttribute(name);
    this.node.setAttribute(name, value);
};
UIElement.prototype.prop = function(name, value)
{
    if(value === undefined) return this.node[name];
    this.node[name] = value;
};
UIElement.prototype.val = function(val)
{
    if(val === undefined) return this.node.value;
    this.node.value = val;
};
UIElement.prototype.src = function(val)
{
    if(val === undefined) return this.node.src;
    this.node.src = val;
};
UIElement.prototype.href = function(val)
{
    if(val === undefined) return this.node.href;
    this.node.href = val;
};
UIElement.prototype.getContext = function(val)
{
    if(val === undefined) return this.node.getContext('2d');
    return this.node.getContext(val);
};
UIElement.prototype.width = function(val)
{
    if(val === undefined) return this.node.width;
    return this.node.width = val;
};
UIElement.prototype.height = function(val)
{
    if(val === undefined) return this.node.height;
    return this.node.height = val;
};
UIElement.prototype.hide = function()
{
    if(this.node.style.display === 'none') return;
    this.node.oldDisplay = this.node.style.display;
    return this.node.style.display = 'none';
};
UIElement.prototype.show = function()
{
    if(this.node.style.display !== 'none' && this.node.offsetParent !== null) return;
    if(this.node.hasOwnProperty('oldDisplay') && this.node.oldDisplay !== 'none'){
        this.node.style.display = this.node.oldDisplay;
    }else{
        this.node.style.display = 'flex';
    }
};
UIElement.prototype.hasClass = function(className)
{
    if(this.node.className === className) return true;
    var curClass = this.node.className.trim();
    var index = curClass.indexOf(className);
    if(index < 0) return false;

    return !(curClass.length !== className.length
    && curClass[index-1] !== ' '
    && (curClass.length > index + className.length + 1
    && curClass[index + className.length + 1] !== ' '));
};
UIElement.prototype.addClass = function(className)
{
    if(this.hasClass(className)) return false;
    this.node.className += ' ' + className;
    this.class = this.node.className;
    return true;
};
UIElement.prototype.removeClass = function(className)
{
    var arr = [];
    if(typeof className === 'string'){
        arr.push(className);
    }else if(Array.isArray(className)){
        arr = className;
    }else{
        return false;
    }

    var result = false;
    for(var i = 0; i < arr.length; i++)
    {
        var classToDelete = arr[i];
        if(!this.hasClass(classToDelete)) continue;

        var curClass = this.node.className.trim();
        var index = curClass.indexOf(classToDelete);

        if(this.node.className === classToDelete){
            this.node.removeAttribute('class');
            result = true;

        }else if(index + classToDelete.length === curClass.length){
            this.node.className = this.node.className.replace(' ' + classToDelete, '');
            if(curClass !== this.node.className) result = true;

        }else{
            this.node.className = this.node.className.replace(classToDelete + ' ', '');
            if(classToDelete !== this.node.className) result = true;
        }
        this.class = this.node.className;
    }

    return result;
};



UIElement.prototype.css = function(style)
{
    for(var p in style){
        this.node.style[p] = style[p];
    }
};



UIElement.prototype.load = function(data, replace, atStart)
{
    if(typeof replace !== 'boolean') replace = true;
    if(typeof atStart !== 'boolean') atStart = false;

    if( data instanceof UIData ){

        data.fetch(function(replace, atStart, response){
            this.load(response, replace, atStart);
        }.bind(this, replace, atStart));


    }else if( typeof data === 'string' ){

        if( this.tag === 'img' ){
            this.src(data);
        }else{
            this.html(data);
        }
        
    }else if(typeof data === 'object'){

        if(Array.isArray(data) ){

            if( this.child === null ) 
                throw new UIELoadException('Trying to load children for UIElement without child UI.');

            if(replace) this.removeChildren(); // Remove all children.

            var child;
            for(var i = 0; i < data.length; i++){
                try{
                    child = this.addChild(atStart);
                    child.load(data[i], replace, atStart);
                }catch(exception){
                    throw exception;
                }   
            }


        }else{

            for(var p in data){
                if( p === 'children' && Array.isArray(data[p]) ){
                    this.load(data[p], replace, atStart);
                }else if( UIElement.prototype.hasOwnProperty(p)  && typeof UIElement.prototype[p] === 'function'){
                    UIElement.prototype[p].call(this, data);  
                }else if( this.hasOwnProperty(p) ){
                    this[p] = data;
                }else{
                    try{this.node[p] = data;}catch(e){}
                }
            }

        }

    }else{
        throw new UIELoadException('Unsupported data type given (' + typeof data + '). Only string or object can be used.');
    }
};






//       Data collectors
// ___________________________
// ---------------------------

function defaultCollector(callback)
{
    if(typeof callback === 'function'){
        callback(this.cache, this);
        this.triggerEvent('fetch', this.cache);
    }
}


function ajaxCollector(callback)
{
    if(typeof this.url !== 'string') return false;
    var _uidata = this;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if(this.status == 200) {
            

            // Get data depending on content-type header.
            var data;
            var contentType = this.getResponseHeader("content-type");
            if( typeof contentType === 'string' && contentType .indexOf('json') >= 0){
                data = JSON.parse(this.responseText);
            }else{
                data = this.responseText;
            }

            _uidata.cache = _uidata.cacheLifitime === null || _uidata.cacheLifitime > 0 ? data : null;
            if(typeof callback === 'function') callback(data, _uidata);
            _uidata.triggerEvent('fetch', data);
        }else{
            _uidata.triggerEvent('error');
        }
        _uidata.lastFetchTime = Date.now();
        _uidata.ready = true;
    };
    xhttp.open("POST", this.url, true);
    xhttp.send();
}





//       Data providers
// ___________________________
// ---------------------------



function UIData(params)
{
    this.ready = true;      // Flag if UIData is ready to fetching.
    this.cache = null;      // Data got by last fetch.
    this.cacheLifetime = null; // Lifetime of cache
    this.events = {};       // Events handlers.

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
    this._parameters = {};
}
UIData.prototype = {constructor : UIData};

UIData.prototype.parameters = function(parameters)
{
    this._parameters = parameters;
    return this;
};

UIData.prototype.addEventListener = function(eventName, handler)
{
    if(typeof handler !== 'function') return false;
    var handlers;
    if( !this.events.hasOwnProperty(eventName) ) {
        handlers = [];
        this.events[eventName] = handlers;
    }else{
        handlers = this.events[eventName];
    }
    if( handlers.indexOf(handler) < 0 ) handlers.push(handler);
    return true;
};

UIData.prototype.triggerEvent = function(eventName, argument)
{
    if( !this.events.hasOwnProperty(eventName) ) return false;
    var handlers = this.events[eventName];
    for(var i = 0; i < handlers.length; i++){
        handlers[i].call(this, argument);
    }
    return i > 0;
};

UIData.prototype.removeEventListener = function(eventName, handler)
{
    if( !this.events.hasOwnProperty(eventName) ) return false;
    var handlers = this.events[eventName];
    var index = handlers.indexOf(handler);
    if( index >= 0 ) handlers.splice(index, 1);
    return true;
};


UIData.prototype.fetch = function(callback)
{
    if(typeof params === 'object') this.params = params;
    if( this.ready && typeof this.collector === 'function'){
        this.ready = false;
        return this.collector(callback);
    }
    return false;
};


_uibuilder.UIData = UIData;






function UIDataAJAX(params)
{
    UIData.call(this, params);
    this.url = params.hasOwnProperty('url') ? params.url : '';
    this.collector = ajaxCollector;
}
UIDataAJAX.prototype = Object.create(UIData.prototype);
UIDataAJAX.prototype.constructor = UIData;
_uibuilder.UIDataAJAX = UIDataAJAX;


return _uibuilder;

})();
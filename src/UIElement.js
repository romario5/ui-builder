var globalName = require('./settings').globalName;
var LList = require('llist');

/* Constructor of the elements that UIInstance contains within */
function UIElement(params)
{
    // set parameters
    this.name  = params.name;
    this.child = (params.child !== undefined) ? params.child : null; // string or null
    this.class = (params.class !== undefined) ? params.class : null  // string or null
    this.id    = (params.id !== undefined) ? params.id : null        // string or null
    this.tag   = (params.tag !== null && params.tag !== undefined) ? params.tag : 'div';

    // create node
    if(this.tag === '') this.tag = 'div';
    this.node  = document.createElement(this.tag);
    this.uiinstance = null;
    this.node.uiinstance = null;
    this.node.uielement = null;
    this.children = [];

    /* events */
    this.events = {};


    // attach attributes
    for(var p in params.attributes){
        this.node.setAttribute(p, params.attributes[p]);
    }
    // ser properties
    for(var p in params.properties){
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
    if(this.events[eventName] === undefined || this.events[eventName] === null) this.events[eventName] = new LList();
    if(this.events[eventName].indexOf(callback) >= 0) return console.warn('Widgets: handler for the event "'+eventName+'" already added.');
    this.events[eventName].push(callback);
    this.node[eventName] = this.runEvent;
};

UIElement.prototype.runEvent = function(e){
    var handlers = this.uielement.events['on' + e.type];
    var uiinstance = this.uiinstance;
    handlers.withEach(function(data){
        data.call(uiinstance, e);
    });
};

UIElement.prototype.removeChildren = function(){
    for(var i = 0; i < this.children.length; i++) this.children[i].remove();
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
    var ui = window[globalName](this.child);
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
    uiInst.parent(this);
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


module.exports = UIElement;
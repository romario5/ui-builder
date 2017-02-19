var uilist = {};

var UIInstance = require('./UIInstance');
var UIElement = require('./UIElement');


/* UI constructor */
function UI(scheme, rules)
{
    /* list of elements */
    this.elements = {};
    this.scheme = scheme;
    this.rules = rules;
    this.prefix = '';
    this.name = '';
    this.withEach = null;

    /* clone all elements from scheme to 'elements' object */
    function clone(name, value, elements)
    {
        if(typeof value == 'object'){
            for(var p in value){
                clone(p, value[p], elements);
            }
        }
        elements[name] = {
            children : value
        };
    }
    for(var k in scheme){
        clone(k, scheme[k], this.elements);
    }
}
UI.prototype = {constructor : UI};


/**
 * Builds instance of the UI into container.
 * @param container (node) - element in which UIInstance will be built
 * @param atStart   (bool) - if true, builds UI into start of the list (default - false)
 * Returns the instance of UI (UIInstance exemplar)
 * */
UI.prototype.build = function(container, atStart)
{
    var inst = new UIInstance.constructor();
    inst.ui(this);
    if(atStart === undefined || atStart === null) atStart = false;
    if(container instanceof UIElement.constructor){
        inst.parent(container);
        container = container.node;
    }

    // gather parameters that was described in the UI
    function parseParameters(str)
    {
        var params = {};
        params.tag   = str.match(/@\w+[_-\w]*/ig);
        params.id    = str.match(/#\w+[_-\w]*/ig);
        params.class = str.match(/\.\w+[_-\w\s]*/ig);
        params.child = str.match(/\|\w+[_-\w]*/ig);
        // parse attributes
        params.attributes = {};
        var att = str.match(/\[(\w+[_-\w]*=\w+[_-\w]*[;]?)+\]/ig);
        (att !== null && att.length > 0) ? att = att[0].slice(1, -1) : att = '';
        att = att.split(';');
        var p;
        for(var i = 0; i < att.length; i++){
            p = att[i].split('=');
            if(p.length === 2){
                params.attributes[p[0]] = p[1];
            }
        }
        // parse properties
        params.properties = {};
        var pr = str.match(/\((\w+[_-\w]*=\w+[_-\w]*[;]?)+\)/ig);
        (pr !== null && pr.length > 0) ? pr = pr[0].slice(1, -1) : pr = '';
        pr = pr.split(';');
        var p;
        for(var i = 0; i < pr.length; i++){
            p = pr[i].split('=');
            if(p.length === 2){
                params.properties[p[0]] = p[1];
            }
        }
        if(params.tag    !== null) params.tag    = params.tag[0].slice(1).trim();
        if(params.id     !== null) params.id     = params.id[0].slice(1).trim();
        if(params.class  !== null) params.class  = params.class[0].slice(1).trim();
        if(params.child  !== null) params.child  = params.child[0].slice(1).trim();
        return params;
    }


    // append items recursively
    function append(name, obj, container, atStart)
    {
        if(atStart === undefined || atStart === null) atStart = false;
        var params;

        if(typeof obj === 'string'){
            params = parseParameters(obj);
        }else if(typeof this.rules[name] === 'string'){
            params = parseParameters(this.rules[name]);
        }else{
            params = parseParameters('');
        }
        params.name = name;
        var el = new UIElement.constructor(params);
        el.node.uiinstance = inst;
        el.node.uielement = el;
        inst[name] = el;

        // set default class for the element if it's not specified
        if(el.class === null){
            el.class = el.node.uiinstance.ui().prefix + '-' + name;
            el.node.className = el.class;
        }


        if(this.elements.hasOwnProperty(name) && typeof this.elements[name] === 'object'){
            for(var p in this.elements[name]){
                el.node[p] = this.elements[name][p];
            }
        }

        if(atStart){
            var first = container.firstChild;
            if(first !== null){
                container.insertBefore(el.node, first);
            }else{
                container.appendChild(el.node);
            }
        }else{
            container.appendChild(el.node);
        }


        if(typeof obj === 'object'){
            for(var p in obj){
                append.call(this, p, obj[p], el.node, false);
            }
        }
    }

    for(var k in this.scheme){
        append.call(this, k, this.scheme[k], container, atStart);
    }

    if(typeof this.withEach === 'function') this.withEach.call(inst);
    return inst;
};





function register(data)
{
    if(!data.hasOwnProperty('name')){
        console.warn('UIBuilder - UI register: name of a new UI is not defined.');
        return false;
    }
    if(typeof data.name !== 'string'){
        console.warn('UIBuilder - UI register: name of a new UI is ' + (typeof data.rules) + '. String required.');
        return false;
    }

    if(uilist.hasOwnProperty(data.name)){
        console.warn('UIBuilder - UI register: UI with name "' + data.name + '" already registered.');
        return false;
    }

    if(!data.hasOwnProperty('scheme')){
        console.warn('UIBuilder - UI register: scheme for a new UI "' + data.name + '" absent.');
        return false;
    }

    if(!data.hasOwnProperty('rules')) data.rules = {};
    if(typeof data.rules !== 'object'){
        console.warn('UIBuilder - UI register: rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');
        data.rules = {};
    }


    uilist[data.name] = new UI(data.scheme, data.rules);
    uilist[data.name].prefix = data.name;
    uilist[data.name].name = data.name;
    return true;
}


function getByName(name)
{
    if(uilist.hasOwnProperty(name)) return uilist[name];
    return null;
}



exports.consructor = UI;
exports.register = register;
exports.getByName = getByName;
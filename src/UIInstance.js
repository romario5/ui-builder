var UIElement = require('./UIElement');

/* Constructor of the UI instance */
function UIInstance(){
    var _parent = null;
    var _ui = null;


    this.parent = function(p){
        if(p === undefined) return _parent;
        _parent = p;
    };
    this.ui = function(ui){
        if(ui === undefined) return _ui;
        _ui = ui;
    };
}

UIInstance.prototype = {constructor : UIInstance};

UIInstance.prototype.remove = function()
{
    // removes this instance from the parent children[] property
    var parent = this.parent();
    for(var i = 0; i < parent.children.length; i++)
    {
        if(parent.children[i] === this){
            var scheme = this.ui().scheme;
            for(var p in scheme) parent.node.removeChild(this[p].node);
            parent.children.splice(i, 1);
            break;
        }
    }
};
UIInstance.prototype.parentUII = function()
{
    var parent = this.parent();
    if(parent instanceof UIElement) return parent.uiinstance;
    return null;
};

module.exports = UIInstance;
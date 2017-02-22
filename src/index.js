var UI = require('./UI');
var Settings = require('./settings');


var UIBuilder = function(uiname){
    return UI.getByName(uiname);
};
UIBuilder.register = UI.register;
UIBuilder.UI = UI;
UIBuilder.UIInstance = require('./UIInstance');
UIBuilder.UIElement = require('./UIElement');

window[Settings.globalName] = UIBuilder;

module.exports = UIBuilder;
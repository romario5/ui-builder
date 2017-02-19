var UI = require('./UI');
var Settings = require('./settings');


window[Settings.globalName] = function(uiname){
    return UI.getByName(uiname);
};
var UIBuilder = window[Settings.globalName];

UIBuilder.UI = UI;
UIBuilder.UIInstance = require('./UIInstance');
UIBuilder.UIElement = require('./UIElement');

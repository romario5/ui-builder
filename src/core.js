/**
 * @var {object} Private variable that stores UIs.
 */
var uiList = {};


/**
 * Extendings of the UI.
 * @type {{}}
 */
var uiExtendings = {};


/**
 * Exported function.
 * @param {string} name Name of the UI.
 * @return {UI|null}
 */
function _uibuilder(name) {
    if (uiList.hasOwnProperty(name)) {
        return uiList[name];
    }

    if(uiExtendings.hasOwnProperty(name)){
    	uiList[name] = uiExtendings[name].extend();
    	delete uiExtendings[name];
    	return uiList[name];
	}
    return null;
}


var resetStyles = {};


/**
 * Generates reset styles.
 */
_uibuilder.createResetStyles = function(styles)
{
    if(styles === undefined){
        styles = resetStyles;
    }else{
        resetStyles = styles;
    }
    var css = "\n";
    for(var p in styles){
        if(typeof styles[p] !== 'object'){
            continue;
        }
        css += p + " {\n";
        for(var s in styles[p]){
            var val = styles[p][s];
            if(val instanceof StyleGetter){
                val = val.getValue();
            }
            css += '    ' + makeClassName('' + s) + ': ' + val + ";\n";
        }
        css += "}\n";
    }

    var styleTag = document.querySelector('style[data-reset="ui-builder"]');

    if(styleTag === null){
        var head = document.getElementsByTagName('head')[0];
        styleTag = document.createElement('style');
        styleTag.setAttribute('data-reset', 'ui-builder');

        // Add comment if logging is enabled.
        if (Settings.logging) {
            var comment = document.createComment('--- UIBuilder reset styles ---');
            head.appendChild(comment);
        }
        head.appendChild(styleTag);
    }

    styleTag.innerHTML = css;
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


/**
 * Registers new UI.
 * @param data (object)
 * {
 *      name   : (string),
 *      scheme : (object),
 *      rules  : (object)
 * }
 */
_uibuilder.register = function(data) {
	if(typeof data === 'string'){
		data = {name : data};
	}
	checkUIParameters(data);
	uiList[data.name] = new UI(data);
	_uibuilder.triggerEvent('register', uiList[data.name]);
	return uiList[data.name];
};




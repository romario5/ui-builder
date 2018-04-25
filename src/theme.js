/**
 *           Themes
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
     * Add events support for the exported function.
     */
	addEventsImplementation.call(t);


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
			t.triggerEvent('register');
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

		this.triggerEvent('switch');

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
	 * @return {string|number|null|Color}
	 */
	t.getStyle = function(name)
	{
		if(currentTheme === null){
			warn('Theme is not selected');
			return null;
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
				return null;
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
				if(typeof params[p] === 'object' && !(params[p] instanceof Color)){
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
		return null;
	}
	return this.styles[name];
};


/**
 * Constructor of objects that used to store theme links.
 */
function StyleGetter(name)
{
	this.name = name;
	this._darker = 0;
	this._lighter = 0;
	this._alpha = undefined;
	this._default = 'initial';
}

/**
 * Object that will be returned to the property on theme property using inside styles definition.
 * The value will be resolved on CSS rendering.
 * @type {{constructor: StyleGetter, getValue: StyleGetter.getValue, alpha: StyleGetter.alpha, darker: StyleGetter.darker, lighter: StyleGetter.lighter}}
 */
StyleGetter.prototype = {
	constructor : StyleGetter,
	getValue : function(){
		var value = _theme.getStyle(this.name);
		if(value instanceof Color){
			var c = new Color(value.toRgbaString());
			if(this._darker > 0) c.darker(this._darker);
			if(this._lighter > 0) c.lighter(this._lighter);
			value = c.toRgbaString(this._alpha);
		}
		if(value === null){
		    return this._default;
        }
		return value;
	},
	alpha : function(value){
		this._alpha = value;
		return this;
	},
	darker : function(amount){
		this._darker += amount;
		return this;
	},
	lighter : function(amount){
		this._lighter += amount;
		return this;
	},
    default : function(value){
        this._default = value;
        return this;
    }
};
/**
 *        UIInstance
 * ___________________________
 * ---------------------------
 *
 * UIInstance is representation of UI instances, kind of container of interface part.
 */


/**
 *  Constructor of the UI instance.
 */
function UIInstance() {
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value: {},
		configurable: false,
		enumerable: false,
		writeable: false
	});

	this.__.events = {};
	this.__.ui = null;
	this.__.parent = null;
	this.__.data = null;
	this.__.params = {};
}


/**
 * Checks whether subject is instance of the UI.
 * @param subject
 * @returns {boolean}
 */
_uibuilder.isInstance = function(subject){
	return subject instanceof UIInstance;
};

UIInstance.prototype = {constructor: UIInstance};

// Add events supporting for UIInstance.
addEventsImplementation.call(UIInstance.prototype);


/**
 * Removes UIInstance from the parent UIElement.
 */
UIInstance.prototype.remove = function () {
	// remove this instance from the parent children[] property
	var parent = this.__.parent;
	var scheme = this.__.ui.scheme;


	for (var p in scheme) {
		if (scheme.hasOwnProperty(p) && this[p].__.node.parentNode !== null){
			this[p].__.node.parentNode.removeChild(this[p].__.node);
        }
	}

	if (parent instanceof UIElement !== true) return;

	for (var i = 0, len = parent.__.children.length; i < len; i++) {
		if (parent.__.children[i] === this) {
			parent.__.children.splice(i, 1);
			break;
		}
	}
};


/**
 * Returns UI of the instance.
 * @returns {UI|*}
 * @constructor
 */
UIInstance.prototype.UI = function () {
	return this.__.ui;
};


/**
 * Returns parameters of the instance.
 * @returns {UI|*}
 * @constructor
 */
UIInstance.prototype.params = function () {
	return this.__.params;
};


/**
 * Returns parent UIInstance.
 * @return UIInstance|null
 */
UIInstance.prototype.parentUII = function () {
	var parent = this.__.parent;
	if (parent instanceof UIElement) return parent.__.uiinstance;
	return null;
};


/**
 * Loads data to the instance.
 * @param {object} data        Data to be loaded.
 * @param {boolean} [replace]        If true all existing data will be removed before loading.
 * @param {boolean} [atStart]        If true new data will be inserted into the start.
 */
UIInstance.prototype.load = function (data, replace, atStart) {
	if (typeof replace !== 'boolean') replace = true;
	if (typeof atStart !== 'boolean') atStart = false;

	if (data instanceof UIData) {
		try {
			data.fetch(function (replace, atStart, response) {
				this.load(response, replace, atStart);
                this.triggerEvent('afterload', data);
                this.__.ui.triggerEvent('afterload', this, data);
			}.bind(this, replace, atStart));
			return this;
		} catch (e) {
			error(e);
		}
	}


	// Trigger event on the UI.
	var event = new UIEvent('load');
	event.target = this.__.ui;
	this.__.ui.triggerEvent('load', this, data, event);
	if (event.canceled){
        this.triggerEvent('afterload', data);
        this.__.ui.triggerEvent('afterload', this, data);
	    return this;
    }

	// Trigger event on the instance.
	event = new UIEvent('load');
	event.target = this;
	this.triggerEvent('load', data, event);
	if (event.canceled){
        this.triggerEvent('afterload', data);
        this.__.ui.triggerEvent('afterload', this, data);
	    return this;
    }


	if (typeof data !== 'object') {
		//warn('Instance data loading error: invalid argument. Object is required but ' + typeof data + ' given.');
	}

	var root = this.getRootElement();
	if (typeof data === 'string') {

		if (root !== null) {
			root.load(data, replace, atStart);
            this.triggerEvent('afterload', data);
            this.__.ui.triggerEvent('afterload', this, data);
			return this;
		}
	}


	if (Array.isArray(data)) {
		if (root !== null) {
			root.load(data, replace, atStart);
            this.triggerEvent('afterload', data);
            this.__.ui.triggerEvent('afterload', this, data);
			return this;
		}
	}


	for (var p in data) {
		if (p === '__') continue; // Prevent from changing some initial properties.

		if (this.hasOwnProperty(p)) {
			var el = this[p];

			if (this[p] instanceof UIElement) {

				var inclusion = el.inclusion(); // Included UIInstance
				if (inclusion instanceof UIInstance) {

					if (Array.isArray(data[p])) {
						var incRoot = inclusion.getRootElement();
						if (incRoot === null || !el.hasChildUI()) {
							inclusion.load(data[p], replace, atStart);
						} else {
							try {
								incRoot.load(data[p], replace, atStart);
							} catch (e) {
								error(e);
							}
						}
					} else {
						inclusion.load(data[p], replace, atStart);
					}


				} else {
					try {
						this[p].load(data[p], replace, atStart);
					} catch (e) {
						error(e);
					}
				}

			} else {
				el.load(data[p], replace, atStart);
			}
		}else if(uiList.hasOwnProperty(p)){
			if (root !== null) {
				uiList[p].renderTo(root, false, {}).load(data[p], true, false);
			}
		}
	}
	this.triggerEvent('afterload', data);
	this.__.ui.triggerEvent('afterload', this, data);
	return this;
};


/**
 * Returns top level UIElement that contains all another element.
 * If top level has few elements - null will be returned.
 * @returns {UIElement}
 */
UIInstance.prototype.getRootElement = function () {
	var topLevel = Object.keys(this.__.ui.scheme);
	return topLevel.length === 1 && this.hasOwnProperty(topLevel[0]) ? this[topLevel[0]] : null;
};
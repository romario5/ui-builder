/**
 *          Spinner
 * ___________________________
 * ---------------------------
 *
 * Spinner is a special UI that provides few special methods:
 * showInside(target) - Shows spinner in the given container (UIElement or node).
 * hideInside(target) - Smoothly hides all spinners in the given container and after removes it.
 *
 * Also animation can be defined for fading effect.
 * This section will be done later.
 */
function Spinner(params)
{
	// Extending UI.
	UI.call(this, params);
}
Spinner.prototype = Object.create(UI.prototype);


/**
 * Renders spinner inside target element.
 * Fades in just after rendering.
 * Node that if you want to apply your own fading effects
 * please use onfadein event in the parameters.
 */
Spinner.prototype.showInside = function(target, params)
{
	var inst = this.renderTo(target, params);

	var event = new UIEvent('fadein');
	event.target = this;
	this.triggerEvent('fadein', inst, event);

	// If event was not prevented - use default fading effect.
	if(!event.canceled){
		var root = inst.getRootElement();
		if (root !== null) {
			root.css({opacity : 0}).fadeIn(250);
		}
	}
};


/**
 * Hides all spinners inside target element.
 * Fades out just before removing.
 * Node that if you want to apply your own fading effects
 * please use onfadeout event in the parameters.
 */
Spinner.prototype.hideInside = function(target)
{
	var children;
	if(target instanceof UIElement){
		children = target.children();
	}else{
		children = target.childNodes;
	}
	var arr = [];
	for(var i = 0; i < children.length; i++){
		arr[i] = children[i];
	}
	for(var i = 0; i < arr.length; i++){
		var child = arr[i];
		if(!(child instanceof UIInstance)){
			child = child.uiinstance;
			if(!(child instanceof UIInstance)) continue;
		}
		if(child.UI() !== this) continue;

		var event = new UIEvent('fadeout');
		event.target = this;
		this.triggerEvent('fadeout',child , event);

		// If event was not prevented - use default fading effect and then remove spinner instance.
		if(!event.canceled){
			var root = child.getRootElement();
			if (root !== null) {
				root.animate({opacity : 0}, 250, function(){
					if(child !== undefined) child.remove();
				});
			}
		}
	}
};


// Add unique function for registering spinners.
_uibuilder.registerSpinner = function(data){
	checkUIParameters(data);
	uiList[data.name] = new Spinner(data);
	_uibuilder.triggerEvent('register', uiList[data.name]);
};
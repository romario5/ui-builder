/**
 *           Tabs
 * ___________________________
 * ---------------------------
 *
 * Implements simple tabs behaviour.
 *
 * @returns {boolean}
 */
UIElement.prototype.isTab = function () {
	return this.__.tabContainer !== null;
};


/**
 * Links element as tab for some container.
 * @param container
 */
UIElement.prototype.makeTabFor = function (container) {
	this.__.tabContainer = container;
	container.hide();
	var siblings = this.getAllNearbyElements();
	this.on('click', tabClickHandler);

	for(var i = 0, len = siblings.length; i < len; i++){
		if(siblings[i].isTab()){
			return this;
		}
	}

	this.addClass('active');
	container
		.addClass('active')
		.css({
			display: 'flex',
			opacity: 1
		});

	return this;
};


/**
 * Returns container which is linked contend for the element.
 * @returns {UIElement.tabContainer|*|null}
 */
UIElement.prototype.tabContainer = function () {
	return this.__.tabContainer;
};


/**
 * Click event handler of the tab.
 */
function tabClickHandler() {
	if (!this.isTab()) return;

	// Toggle tabs class.
	var c = this.getAllNearbyElements();
	for (var i = 0, len = c.length; i < len; i++) {
		if(c[i].isTab()){
			c[i].removeClass('active');
			c[i].__.tabContainer.fadeOut(100, function(){
				this.hide();
			});
		}
	}
	this.addClass('active');



	var container = this.__.tabContainer;

	// Process fade-in animation.
	setTimeout(function () {
		container.fadeIn(100, 'flex');
	}, 100);

	container.addClass('active');
}
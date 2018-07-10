/**
 *           Dropdowns
 * ___________________________
 * ---------------------------
 *
 * Methods that used for implementing dropdown mechanic.
 * For marking dropdowns used speciall class - .dropdown
 * If dropdown is shown - .shown class will be used.
 *
 * @return UIElement
 */
UIElement.prototype.makeDropdown = function(target, collapseOnSecondClick)
{
	this.addClass('dropdown-handle');
	target.addClass('dropdown');
	target.hide();
	this.__.dropdownTarget = target;
	target.__.dropdownHandle = this;
	this.on('click', dropdownHandler);
	return this;
};


/**
 * Dropdown click handler.
 */
function dropdownHandler()
{
	var expand = !this.hasClass('dropdown-expanded');
	var target = this.__.dropdownTarget;

	var event = new Event('blur', {cancelable: true});
	target.triggerEvent('blur', this, event);

	// Stop do anything if event is canceled.
	if(event.defaultPrevented){
		return;
	}

	if(expand){
		this.addClass('dropdown-expanded');
		target.addClass('dropdown-expanded');
		event = new Event('expand', {cancelable: true});
		target.triggerEvent('expand', this, event);
		// Use default expanding animation if event is canceled.
		if(!event.defaultPrevented){
			target.slideDown(100, function(){
				this.css({display: 'flex'});
			});
		}
	}else{
		this.removeClass('dropdown-expanded');
		target.removeClass('dropdown-expanded');
		event = new Event('collapse', {cancelable: true});
		target.triggerEvent('collapse', this, event);
		// Use default collapsing animation if event is canceled.
		if(!event.defaultPrevented){
			target.slideUp(100, function(){
				this.css({display: 'none'});
			});
		}
	}
}


document.addEventListener('mousedown', function(e){
	var target = e.target;

	// Loop through parents to check if user clicked on the expanded.
	while( (
				   !(target.uielement instanceof UIElement)
				|| !(target.uielement.__.dropdownHandle instanceof UIElement)
			)
		&& target !== document.body
	){
		if(target.uielement instanceof UIElement && target.uielement.__.dropdownTarget instanceof UIElement){
			target = target.uielement.__.dropdownTarget.__.node;
			break;
		}
		if(target.uielement instanceof UIElement && target.uielement.__.dropdownHandle instanceof UIElement){
			target = target.uielement.__.node;
			break;
		}
		target = target.parentNode;
		if(target === null){
			break;
		}
	}

	var items = document.getElementsByClassName('dropdown-expanded');
	items = Array.prototype.slice.call(items);

	for(var i = 0, len = items.length; i < len; i++){
		if(items[i] === target) continue;
		if(items[i].uielement instanceof UIElement
			&& items[i].uielement.__.dropdownTarget instanceof UIElement
			&& items[i].uielement.__.dropdownTarget.__.node === target
		){
			continue;
		}


		if(items[i].uielement instanceof UIElement){

			if(items[i].uielement.__.dropdownHandle instanceof UIElement){
				if(items[i].uielement.__.dropdownHandle === target) continue;
				items[i].uielement.removeClass('dropdown-expanded');
				items[i].uielement.__.dropdownHandle.removeClass('dropdown-expanded');

				// Collapse dropdown.
				var event = new Event('collapse', {cancelable: true});
				items[i].uielement.triggerEvent('collapse', items[i].uielement, event);
				if(!event.defaultPrevented){
					items[i].uielement.slideUp(100, function(){
						this.css({display: 'none'});
					});
				}
			}
		}
	}
});
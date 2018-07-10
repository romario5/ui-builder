/**
 *          Dragging
 * ___________________________
 * ---------------------------
 *
 * UIElement methods that allows to simply drag items
 * within the parent container or globally.
 */


/**
 * Makes element draggable.
 * @param params
 */
UIElement.prototype.makeDraggable = function(params){
	this.__.draggable = true;
	this.__.dragX = params.x === true;
	this.__.dragY = params.y === true;
	this.__.dragWithinParent = params.withinParent === true;
	this.__.dragBoundaries = params.boundaries !== false;
	this.on('mousedown', dragStartHandler);
	this.on('touchstart', dragStartHandler);
};



/**
 * In case of dragged element always can by only one so the link
 * to it will be stored in this variable.
 * If [dragged] is null - no element is dragging at the moment.
 * @type {null|UIElement}
 */
var dragged = null;


/**
 * The time when last dragging process was ended.
 * @type {number}
 */
var lastDragTime = 0;


/**
 * Returns time when last dragging process was ended.
 * @returns {number}
 */
_uibuilder.getLastDragTime = function(){
	return lastDragTime;
};


/**
 * Returns dragged element.
 * @returns {null|UIElement}
 */
_uibuilder.getDraggedElement = function(){
	return dragged;
};

/**
 * Initial mouse position.
 * Will be stored once at the dragging start (onmousedown).
 * @type {number}
 */
var initialX = 0;
var initialY = 0;

/**
 * Initial position of the dragged element.
 * @type {number}
 */
var initialTop = 0;
var initialLeft = 0;

/**
 * Initial position of the dragged element's parent node.
 * @type {number}
 */
var initialParentTop = 0;
var initialParentLeft = 0;

/**
 * Event handler.
 * Function that will be used as event handler when draggable behavior
 * is applied to the element.
 * @this {UIElement}
 * @event dragstart
 * @param e {MouseEvent}
 */
function dragStartHandler(inst, e)
{
	e.preventDefault();

	var event = new Event('dragstart', {cancelable: true});
	event.target = this;
	this.triggerEvent('dragstart', inst, event);
	if(event.defaultPrevented){
		return;
	}

	// Store initial mouse position.
	initialX = e.touches !== undefined ? e.touches[0].clientX : e.clientX;
	initialY = e.touches !== undefined ? e.touches[0].clientY : e.clientY;

	// Store initial position of the dragged element.
	var box = this.clientRect();

	initialTop = box.top;
	initialLeft = box.left;

	// Store parent node initial position.
	box = this.__.node.parentNode.getBoundingClientRect();

	// Get border width of the top and left sides.
    var style = getComputedStyle(this.node().parentNode);
    var borderLeft = parseInt((style.borderLeftWidth + '').replace('px', ''));
    var borderTop = parseInt((style.borderTopWidth + '').replace('px', ''));

    // Exclude border width from position delta by adding border to the parent coordinates.
    initialParentTop = box.top + borderTop;
    initialParentLeft = box.left + borderLeft;

	// Set element as dragged.
	dragged = this;
	this.addClass('dragged');
}


/**
 * Event handler.
 * Called on each mouse move.
 * @param e
 */
function draggingHandler(e)
{
	if(dragged === null) return;
	var withinParent = dragged.__.dragWithinParent;

	var mX = e.touches !== undefined ? e.touches[0].clientX : e.clientX;
	var mY = e.touches !== undefined ? e.touches[0].clientY : e.clientY;

	var deltaX = mX - initialX;
	var deltaY = mY - initialY;

	var iTop = withinParent ? initialTop - initialParentTop  : initialTop;
	var iLeft = withinParent ? initialLeft - initialParentLeft : initialLeft;

	var newLeft = iLeft + deltaX;
	var newTop = iTop + deltaY;

	if(dragged.__.dragBoundaries){
        // Prevent from dragging outside along X.
        if(newLeft < 0) newLeft = 0;
        if(withinParent){
            var myW = dragged.__.node.clientWidth;
            var parentW = dragged.__.node.parentNode.clientWidth;
            if(newLeft > parentW - myW){
                newLeft = parentW - myW;
            }
        }

        // Prevent from dragging outside along Y.
        if(newTop < 0) newTop = 0;
        if(withinParent){
            var myH = dragged.__.node.clientHeight;
            var parentH = dragged.__.node.parentNode.clientHeight;
            if(newTop > parentH - myH){
                newTop = parentH - myH;
            }
        }
	}

	var event = new Event('drag', {cancelable: true});
	event.target = dragged;
	var initialPoint = new Point(iLeft, iTop);
	var newPoint = new Point(newLeft, newTop);
	dragged.triggerEvent('drag', dragged.UII(), initialPoint, newPoint, event);
	if(event.defaultPrevented){
		return;
	}

	var cssObj = {position: withinParent ? 'absolute' : 'fixed'};
	if(dragged.__.dragX){
		cssObj.left = newPoint.x + 'px';
	}
	if(dragged.__.dragY){
		cssObj.top = newPoint.y + 'px';
	}
	dragged.css(cssObj);
}


/**
 * Event listener.
 * Called each time user releases mouse.
 * Terminates current dragging and triggers necessary events.
 * @param e
 */
function dragEndHandler(e)
{
	if(dragged !== null){
		lastDragTime = Date.now();
		dragged.triggerEvent('dragend', dragged.UII(), e);
		dragged.removeClass('dragged');
	}
	dragged = null;
}

document.addEventListener('mousemove', draggingHandler);
document.addEventListener('touchmove', draggingHandler);
document.addEventListener('mouseup', dragEndHandler);
document.addEventListener('touchend', dragEndHandler);
export default function registerDragExtension()
{
    /**
     * Drag extension.
     *
     * Allows to simply drag items within the parent container or globally.
     * Example of usage:
     *
     * inst.knob.applyExtension('Drag', {x: true, y: false, withinParent: true});
     */
    Extension.register('Drag', {
        params: {
            x: true,
            y: true,
            withinParent: true,
            useBoundaries: false,
            handle: null
        },

        onApply(ext) {
            let params = ext.params;

            // Set default handle if it's not given.
            if (params.handle === null) {
                if (ext.target.UII().isImplementationOf('Draggable')) {
                    params.handle = ext.target.UII().getHandle();
                } else {

                    params.handle = ext.target;
                }
            }

            // Store drag target on the node.
            params.handle.__.dragTarget = ext.target;

            params.handle.on('mousedown', dragStartHandler);
            params.handle.on('touchstart', dragStartHandler);
        },

        onUpdate(ext, newParams) {
            let params = ext.params;
            for (let p in newParams) {
                if (newParams.hasOwnProperty(p) && params.hasOwnProperty(p)) {
                    params[p] = newParams[p];
                }
            }
        },

        onRemove(ext) {
            ext.target.off('mousedown', dragStartHandler);
            ext.target.off('touchstart', dragStartHandler);
        },

        getDragged() {
            return dragged;
        }
    });

    /**
     * Private variables that store intermediate values.
     */
    let dragged = null,
        initialX = 0,
        initialY = 0,
        initialTop = 0,
        initialLeft = 0,
        initialParentTop = 0,
        initialParentLeft = 0,

        x = true,
        y = true,
        withinParent = true,
        useBoundaries = false;

    /**
     * Event handler.
     * Function that will be used as event handler when draggable behavior
     * is applied to the element.
     * @this {Element}
     * @param inst {Instance}
     * @param e {MouseEvent}
     */
    function dragStartHandler(inst, e) {
        e.preventDefault();
        let target = this.__.dragTarget;

        let event = new Event('dragStart', {cancelable: true});
        target.triggerEvent('dragStart', inst, event);
        this.triggerEvent('dragStart', inst, event);
        if(event.defaultPrevented){
            return;
        }

        // Copy properties from the extension parameters.
        let ext = target.__.extensions['Drag'];
        if (ext === undefined) return;
        x = ext.params.x;
        y = ext.params.y;
        withinParent = ext.params.withinParent;
        useBoundaries = ext.params.useBoundaries;

        let pos = target.node().parentNode.style.position;
        if(withinParent && (pos === 'static' || pos === '')) {
            this.node().parentNode.style.position = 'relative';
        }

        // Store initial mouse position.
        initialX = e.touches !== undefined ? e.touches[0].clientX : e.clientX;
        initialY = e.touches !== undefined ? e.touches[0].clientY : e.clientY;

        // Store initial position of the dragged element.
        let box = target.clientRect();

        initialTop = box.top;
        initialLeft = box.left;

        // Store parent node initial position.
        box = target.node().parentNode.getBoundingClientRect();

        // Get border width of the top and left sides.
        let style = getComputedStyle(target.node().parentNode);
        let borderLeft = parseInt((style.borderLeftWidth + '').replace('px', ''));
        let borderTop = parseInt((style.borderTopWidth + '').replace('px', ''));

        // Exclude border width from position delta by adding border to the parent coordinates.
        initialParentTop = box.top + borderTop;
        initialParentLeft = box.left + borderLeft;

        // Set element as dragged.
        dragged = this;
        target.addClass('dragged');
    }


    /**
     * Event handler.
     * Called on each mouse move.
     * @param e
     */
    function draggingHandler(e)
    {
        if(dragged === null) return;

        let target = dragged.__.dragTarget;

        let mX = e.touches !== undefined ? e.touches[0].clientX : e.clientX;
        let mY = e.touches !== undefined ? e.touches[0].clientY : e.clientY;

        let deltaX = mX - initialX;
        let deltaY = mY - initialY;

        let iTop = withinParent ? initialTop - initialParentTop  : initialTop;
        let iLeft = withinParent ? initialLeft - initialParentLeft : initialLeft;

        let newLeft = iLeft + deltaX;
        let newTop = iTop + deltaY;

        if (useBoundaries) {
            // Prevent from dragging outside along X.
            if(newLeft < 0) newLeft = 0;
            if(withinParent){
                let myW = target.__.node.clientWidth;
                let parentW = target.__.node.parentNode.clientWidth;
                if(newLeft > parentW - myW){
                    newLeft = parentW - myW;
                }
            }

            // Prevent from dragging outside along Y.
            if(newTop < 0) newTop = 0;
            if(withinParent){
                let myH = target.__.node.clientHeight;
                let parentH = target.__.node.parentNode.clientHeight;
                if(newTop > parentH - myH){
                    newTop = parentH - myH;
                }
            }
        }

        let event = new Event('drag', {cancelable: true});

        let initialPoint = new Point(iLeft, iTop);
        let newPoint = new Point(newLeft, newTop);
        let deltaPoint = new Point(deltaX, deltaY);

        target.triggerEvent('drag', target.UII(), initialPoint, deltaPoint, event);
        dragged.triggerEvent('drag', target.UII(), initialPoint, deltaPoint, event);

        // If event's default is not prevented - apply new position.
        if(event.defaultPrevented){
            return;
        }

        let cssObj = {position: withinParent ? 'absolute' : 'fixed'};
        if(x){
            cssObj.left = newPoint.x + 'px';
        }
        if(y){
            cssObj.top = newPoint.y + 'px';
        }
        target.css(cssObj);
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
            let target = dragged.__.dragTarget;
            target.triggerEvent('dragEnd', target.UII(), e);
            dragged.triggerEvent('dragEnd', target.UII(), e);
            target.removeClass('dragged');
        }
        dragged = null;
    }

    document.addEventListener('mousemove', draggingHandler);
    document.addEventListener('touchmove', draggingHandler);
    document.addEventListener('mouseup', dragEndHandler);
    document.addEventListener('touchend', dragEndHandler);
}





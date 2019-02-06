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
            // Note that target can be an instance or an element.
            let target = ext.target,
                params = ext.params;

            // Element that will be moved.
            params.targetElement = UI.isElement(target) ? target : target.getRootElement();

            // Set handle if it's not given.
            if (params.handle === null) {
                let inst = target;
                if (UI.isElement(target)) {
                    inst = target.instance();
                }

                // Ensure that we've got an instance.
                if (!UI.isInstance(inst)) {
                    UI.error('Target for the "Drag" extension must be an instance or an element.');
                    return;
                }

                // Draggable interface allows us to get handle for dragging.
                if (inst.isImplementationOf('Draggable')) {
                    params.handle = inst.getHandle();
                } else {
                    params.handle = params.targetElement;
                }
            }


            params.handle.__.extensions['Drag'] = ext;

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
        draggedExt = null,
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

        let ext = this.extension('Drag');
        if (ext === null) ext = this.instance().extension('Drag');
        if (ext === null) return;


        let target = ext.target,
            targetElement = ext.params.targetElement;

        let event = new Event('dragStart', {cancelable: true});
        target.triggerEvent('dragStart', inst, event);

        if (target !== this) {
            this.triggerEvent('dragStart', inst, event);
        }

        // Don't do anything if user interrupts dragging.
        if(event.defaultPrevented) return;

        // Copy properties from the extension parameters to the static variables.
        x = ext.params.x;
        y = ext.params.y;
        withinParent = ext.params.withinParent;
        useBoundaries = ext.params.useBoundaries;

        // Apply relative position to the parent container it position is not set.
        let pos = targetElement.node().parentNode.style.position;
        if(withinParent && (pos === 'static' || pos === '')) {
            targetElement.node().parentNode.style.position = 'relative';
        }

        // Store initial mouse position.
        initialX = e.touches !== undefined ? e.touches[0].clientX : e.clientX;
        initialY = e.touches !== undefined ? e.touches[0].clientY : e.clientY;

        // Store initial position of the dragged element.
        let box = targetElement.clientRect();

        initialTop = box.top;
        initialLeft = box.left;

        // Store parent node initial position.
        box = targetElement.node().parentNode.getBoundingClientRect();

        // Get border width of the top and left sides.
        let style = getComputedStyle(targetElement.node().parentNode);
        let borderLeft = parseInt((style.borderLeftWidth + '').replace('px', ''));
        let borderTop = parseInt((style.borderTopWidth + '').replace('px', ''));

        // Exclude border width from position delta by adding border to the parent coordinates.
        initialParentTop = box.top + borderTop;
        initialParentLeft = box.left + borderLeft;

        // Set element as dragged.
        dragged = this;
        draggedExt = ext;
        targetElement.addClass('dragged');
    }


    /**
     * Event handler.
     * Called on each mouse move.
     * @param e
     */
    function draggingHandler(e)
    {
        if(dragged === null) return;

        let ext = dragged.extension('Drag');
        if (ext === null) ext = dragged.instance().extension('Drag');
        if (ext === null) return;

        let target = ext.target,
            targetElement = ext.params.targetElement;

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
                let myW = targetElement.__.node.clientWidth;
                let parentW = targetElement.__.node.parentNode.clientWidth;
                if(newLeft > parentW - myW){
                    newLeft = parentW - myW;
                }
            }

            // Prevent from dragging outside along Y.
            if(newTop < 0) newTop = 0;
            if(withinParent){
                let myH = targetElement.__.node.clientHeight;
                let parentH = targetElement.__.node.parentNode.clientHeight;
                if(newTop > parentH - myH){
                    newTop = parentH - myH;
                }
            }
        }

        let event = new Event('drag', {cancelable: true});

        let initialPoint = new Point(iLeft, iTop);
        let newPoint     = new Point(newLeft, newTop);
        let deltaPoint   = new Point(deltaX, deltaY);


        target.triggerEvent('drag', targetElement.instance(), initialPoint, deltaPoint, event);

        if (target !== targetElement) {
            targetElement.triggerEvent('drag', targetElement.instance(), initialPoint, deltaPoint, event);
        }


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
        targetElement.css(cssObj);
    }

    /**
     * Event listener.
     * Called each time user releases mouse.
     * Terminates current dragging and triggers necessary events.
     * @param e
     */
    function dragEndHandler(e)
    {
        if(dragged !== null && draggedExt !== null){
            let target = draggedExt.target,
                targetElement = draggedExt.params.targetElement;

            target.triggerEvent('dragEnd', targetElement.instance(), e);
            targetElement.triggerEvent('dragEnd', targetElement.instance(), e);
            targetElement.removeClass('dragged');
        }
        dragged = null;
        draggedExt = null;
    }

    document.addEventListener('mousemove', draggingHandler);
    document.addEventListener('touchmove', draggingHandler);
    document.addEventListener('mouseup', dragEndHandler);
    document.addEventListener('touchend', dragEndHandler);
}





export default function() {

    Extension.register('Sortable', {
        params: {
            x: true,
            y: true,
            placeholderClass: 'placeholder'
        },
        onApply(ext) {
            let target = ext.target,
                params = ext.params,
                dummy = null,
                placeIndex = 0,
                placeholder = null,
                initialOpacity = 1;

            function createDummy(el) {
                let node = document.createElement('div');
                node.className = params.placeholderClass;
                node.style.width = el.outerWidth() + 'px';
                node.style.height = el.outerHeight() + 'px';
                node.style.position = 'fixed';
                node.style.cursor = 'default !important';
                node.style.zIndex = 1000000;
                document.body.appendChild(node);
                node.innerHTML = el.node().outerHTML;
                node.firstChild.style.opacity = initialOpacity;

                let src = el.node().getElementsByTagName('input');
                let dst = node.getElementsByTagName('input');
                for (let i = 0; i < src.length; i++) {
                    dst[i].value = src[i].value;
                }

                return node;
            }

            params.downHandler = function(inst, initialPoint, deltaPoint, event) {
                event.preventDefault();
            };

            // Add transparency to the dragged element to indicate dragging.
            params.dragStartHandler = function (inst) {
                if (UI.isInstance(this)) inst = this;
                let el = inst.getRootElement();
                initialOpacity = el.node().style.opacity === '' ? initialOpacity : el.node().style.opacity;
                el.css({opacity: 0.25});
            };

            // Snap dummy to the cursor and set placeholder in the proper place.
            params.dragHandler = function(inst, initialPoint, deltaPoint, event) {
                event.preventDefault();

                if (UI.isInstance(this)) inst = this;

                let draggedElement = UI.isElement(this) ? this : inst.getRootElement();

                if (dummy === null) {
                    dummy = createDummy(inst.getRootElement());
                }
                let newX = initialPoint.x + deltaPoint.x;
                let newY = initialPoint.y + deltaPoint.y;
                dummy.style.top = newY + 'px';

                if (params.x) {
                    dummy.style.left = newX + 'px';
                } else {
                    dummy.style.left = initialPoint.x + 'px';
                }

                let items = target.children();
                for (let i = 0, len = items.length; i < len; i++) {
                    let item = items[i].getRootElement();

                    // Remove placeholder if it exists.
                    if (placeholder !== null) {
                        target.node().removeChild(placeholder);
                        placeholder = null;
                    }

                    let rect = item.clientRect();
                    let halfH = rect.height/2;

                    // Skip dragged element.
                    if (item === draggedElement) continue;


                    // Before.
                    if ((item.node().previousSibling === null && newY < rect.top + halfH) || (newY < rect.top + halfH && newY > rect.top - halfH)) {
                        if (item.node().previousSibling === draggedElement.node()) continue;
                        placeholder = document.createElement('div');
                        placeholder.style.height = item.outerHeight() + 'px';
                        placeholder.style.width = '1px';
                        target.node().insertBefore(placeholder, item.node());
                        placeIndex = i === 0 ? 0 : i - 1;
                        return;

                    // After.
                    } else if ((item.node().nextSibling === null && newY > rect.top + halfH) || (newY > rect.top + halfH && newY < rect.top + rect.height + halfH)) {
                        if (item.node().nextSibling === draggedElement.node()) continue;
                        placeholder = document.createElement('div');
                        placeholder.style.height = item.outerHeight() + 'px';
                        placeholder.style.width = '1px';
                        if(item.node().nextSibling === null) {
                            target.node().appendChild(placeholder);
                        }
                        target.node().insertBefore(placeholder, item.node().nextSibling);
                        placeIndex = i + 1;
                        return;
                    }
                }
            };

            // Removes dummy and placeholder when dragging stops.
            params.dropHandler = function(inst) {

                if (UI.isInstance(this)) inst = this;

                let draggedElement = UI.isElement(this) ? this : inst.getRootElement();

                if (dummy !== null && dummy.parentNode !== null) {
                    dummy.parentNode.removeChild(dummy);
                    dummy = null;
                }
                if (placeholder !== null) {
                    draggedElement.node().parentNode.removeChild(draggedElement.node());
                    target.node().replaceChild(draggedElement.node(), placeholder);
                    placeholder = null;
                    target.triggerEvent('sort', draggedElement);
                }

                inst.getRootElement().css({opacity: initialOpacity || 1});
            };

            // Applies "Drag" extension to all children.
            let items = target.children();
            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                Extension('Drag').applyTo(item, {
                    withinParent: false,
                    x: params.x,
                    y: params.y
                });

                item.on('dragStart', params.dragStartHandler);
                item.on('drag', params.dragHandler);
                item.on('dragEnd', params.dropHandler);
            }

            // Add events handlers to the newly added items.
            target.on('add', inst => {

                inst.applyExtension('Drag', {
                    withinParent: false,
                    x: params.x,
                    y: params.y
                });

                inst.on('dragStart', params.dragStartHandler);
                inst.on('drag', params.dragHandler);
                inst.on('dragEnd', params.dropHandler);
            });
        },
        onRemove(ext) {

        },
        onUpdate(ext, newParams) {

        }
    });

}

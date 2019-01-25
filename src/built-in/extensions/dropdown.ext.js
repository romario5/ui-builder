export default function () {

    Extension.register('Dropdown', {
        params: {
            side: 'auto',
            target: null
        },

        onApply(ext) {
            let target = ext.target,
                params = ext.params,
                content = params.target;

            target.__._dropdownContent = content;

            content.css({display: 'none'});

            params.clickHandler = function() {
                let expand = !this.hasClass('dropdown-expanded');


                let event = new Event('blur', {cancelable: true});
                /*
                content.triggerEvent('blur', target, event);

                // Stop do anything if event is canceled.
                if(event.defaultPrevented){
                    return;
                }
                */

                if (expand) {
                    target.addClass('dropdown-expanded');
                    content.addClass('dropdown-expanded');
                    event = new Event('expand', {cancelable: true});
                    content.triggerEvent('expand', this, event);
                    // Use default expanding animation if event is canceled.
                    if(!event.defaultPrevented){
                        content.slideDown(100, () => content.css({display: 'flex'}));
                    }
                } else {
                    target.removeClass('dropdown-expanded');
                    content.removeClass('dropdown-expanded');
                    event = new Event('collapse', {cancelable: true});
                    content.triggerEvent('collapse', this, event);
                    // Use default collapsing animation if event is canceled.
                    if(!event.defaultPrevented){
                        content.slideUp(100, () => content.css({display: 'none'}));
                    }
                }
            };

            target.on('click', params.clickHandler);
        },

        onRemove(ext) {
            ext.target.off('click', ext.params.clickHandler);
            delete ext.target.__._dropdownContent;
        }
    });


    // Handle dropdown collapsing.
    document.addEventListener('mousedown', function(e){
        let target = e.target;

        // Loop through parents to check if user clicked on the expanded.
        while (target !== null) {
            if (UI.isElement(target.element) && target.element.hasClass('dropdown-expanded')) {
                target = target.element.node();
                break;
            }
            target = target.parentNode;
        }

        let items = document.getElementsByClassName('dropdown-expanded');
        items = Array.prototype.slice.call(items, 0);

        for (let i = 0, len = items.length; i < len; i++) {
            if (items[i] === target) continue;


            if (UI.isElement(items[i].element) && UI.isElement(items[i].element.__._dropdownContent)) {
                let label = items[i].element;
                let content = label.__._dropdownContent;

                if(content.node() === target || label.node() === target) continue;

                label.removeClass('dropdown-expanded');
                content.removeClass('dropdown-expanded');

                // Collapse dropdown.
                let event = new Event('collapse', {cancelable: true});
                content.triggerEvent('collapse', content, event);
                if(!event.defaultPrevented){
                    content.slideUp(100, function(){
                        content.css({display: 'none'});
                    });
                }
            }
        }
    });

}
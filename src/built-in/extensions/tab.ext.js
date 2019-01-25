export default function () {

    /**
     * Tab extension.
     * Implements tabs behavior to the element and linked content.
     * All tabs and their contents in the container will be toggled.
     */
    Extension.register('Tab', {
        params: {
            label: '',
            content: null,
            activeClass: 'active'
        },

        onApply(ext) {
            let p = ext.params;
            if (p.content === null) {
                UI.warn('No content specified for the extension "Tab".');
                return;
            }

            if (p.label === '') {
                p.label = tabCounter++ + '';
                if (tabCounter > 10000000) tabCounter = 0;
            }

            ext.target.on('click', clickHandler);
        },

        onRemove(ext) {
            ext.target.off('click', clickHandler);
        }
    });


    /**
     * Click handler that toggles active tab.
     * @param event {Event}
     */
    function clickHandler(event) {
        let ext = this.extension('Tab');
        let tabsContainer = this.parent();
        let contentsContainer = ext.params.content.parent();
        let items = tabsContainer.children();
        let activeClass = ext.params.activeClass;
        let linkedContent = ext.params.content;

        // Remove active class from all tabs and add it to the clicked one.
        for (let i = 0; i < items.length; i++) {
            let el = items[i].getRootElement();
            // Skip elements that don't have "Tab" extension.
            if (el.extension('Tab') === null) continue;
            el.removeClass(activeClass);
        }
        this.addClass(activeClass);

        // Hide all contents and show linked with selected tab.
        // Also change toggles active class.
        items = contentsContainer.children();
        for (let i = 0; i < items.length; i++) {
            let el = items[i].getRootElement();
            if (el !== linkedContent) {
                el.removeClass(activeClass).fadeOut(150);
            }
        }
        setTimeout(function () {
            linkedContent.addClass(activeClass).fadeIn(150, 'flex');
        }, 160);
        this.triggerEvent('ext:tab.click', event);
    }


    /**
     * Static counter.
     * Used for the naming tabs without label.
     * @type {number}
     */
    let tabCounter = 0;

}
export default function () {

    /**
     * Simple tabs UI.
     * Styles may be set in the extending UI.
     */
    UI.register({
        name: 'Tabs',

        scheme: {
            wrap: {
                labels: '|Tabs / Label',
                contents: '|Tabs / Content'
            }
        },

        methods: {
            /**
             * Adds new tab with given label.
             * @param label {string}
             * @param [content] {Element}
             * @return {Instance}
             */
            addTab(label, content) {
                if (content === undefined) {
                    content = this.contents.addOne().getRootElement();
                }
                let tab = this.labels.addOne({label: label});
                tab.getRootElement().applyExtension('Tab', {
                    label: label,
                    content: content
                });
                this.activateTab(0);
                return tab;
            },

            /**
             * Removes tab with given label.
             * @param label {string}
             * @return {Instance}
             */
            removeTab(label) {
                let tab = this.getTabByLabel(label);
                if (tab === null) return this;
                tab.getLabel().removeExtension('Tab');
                if (tab.getLabel().hasClass('active')) {
                    this.activateTab(0);
                }
                tab.remove();
                return this;
            },

            /**
             * Hides tab with given label.
             * If tab was active - activates first tab.
             * @param label {string}
             * @return {Instance}
             */
            hideTab(label) {
                let tab = this.getTabByLabel(label);
                let nextTabIndex = 0;
                if (this.getTabByIndex(0) === tab) {
                    nextTabIndex = 1;
                }
                if (tab === null) return this;
                if (tab.getLabel().hasClass('active')) {
                    this.activateTab(nextTabIndex);
                }
                tab.getLabel().hide();
                return this;
            },

            /**
             * Shows tab with given label.
             * @param label {string}
             * @return {Instance}
             */
            showTab(label) {
                let tab = this.getTabByLabel(label);
                if (tab === null) return this;
                tab.getLabel.show('flex');
                return this;
            },

            /**
             * Returns content element for the tab with given label.
             * If tab with this label is absent - null will be returned.
             * @param label {string}
             * @return {Element|null}
             */
            getContentFor(label) {
                let tab = this.getTabByLabel(label);
                if (tab !== null) {
                    return tab.getContent();
                }
                return null;
            },

            /**
             * Hides all contents without any animation.
             */
            hideAllContents() {
                let items = this.contents.children();
                for (let i = 0; i < items.length; i++) {
                    items[i].getRootElement().hide();
                }
            },

            /**
             * Removes active class from the all tabs labels.
             */
            deactivateAllLabels() {
                let items = this.labels.children();
                for (let i = 0; i < items.length; i++) {
                    items[i].getRootElement().removeClass('active');
                }
            },

            /**
             * Returns tab with the given label.
             * If tab with this label is absent - null will be returned.
             * @param label {string}
             * @return {Instance|null}
             */
            getTabByLabel(label) {
                let tabs = this.labels.children();
                for (let i = 0; i < tabs.length; i++) {
                    if (tabs[i].params().label === label) {
                        return tabs[i];
                    }
                }
                return null;
            },

            /**
             * Returns tab with given index.
             * @param index
             * @return {null}
             */
            getTabByIndex(index) {
                let tabs = this.labels.children();
                for (let i = 0; i < tabs.length; i++) {
                    if (i === index) {
                        return tabs[i];
                    }
                }
                return null;
            },

            /**
             * Returns tab with the given label/index.
             * @param labelOrIndex {string|number}
             * @return {Instance|null}
             */
            getTab(labelOrIndex) {
                let tab = this.getTabByLabel(labelOrIndex);
                if (tab === null) {
                    tab = this.getTabByIndex(labelOrIndex);
                }
                return tab;
            },

            /**
             * Activates tab with given label.
             * @param label {string}
             * @return {Instance}
             */
            activateTabByLabel(label) {
                this.hideAllContents();
                this.deactivateAllLabels();
                let tab = this.getTabByLabel(label);
                if (tab !== null) {
                    tab.getLabel().addClass('active');
                    tab.getContent().addClass('active').show();
                }
                return this;
            },

            /**
             * Activates tab with given index.
             * Indexing begins from zero.
             * @param index {number}
             * @return {Instance}
             */
            activateTabByIndex(index) {
                this.hideAllContents();
                this.deactivateAllLabels();
                let tab = this.getTabByIndex(index);
                if (tab !== null) {
                    tab.getLabel().addClass('active');
                    tab.getContent().addClass('active').show();
                }
                return this;
            },

            /**
             * Activates tab with the given label or index without any animation.
             * Indexing begins from zero.
             * @param labelOrIndex {string|number}
             * @return {Instance}
             */
            activateTab(labelOrIndex) {
                this.hideAllContents();
                this.deactivateAllLabels();
                let tab = this.getTab(labelOrIndex);
                if (tab !== null) {
                    tab.getLabel().addClass('active');
                    tab.getContent().addClass('active').show();
                }
                return this;
            },

            /**
             * Removes all tabs with their contents.
             * @return {Instance}
             */
            removeAllTabs() {
                let items = this.contents.children();
                for (let i = 0; i < items.length; i++) {
                    items[i].remove();
                }
                return this;
            }
        }
    });


    /**
     * Label represents handle for the tab content.
     * Contains two methods: getLabel() and getContent() that returns elements for label and content.
     * Styles may be set in the extending UI.
     */
    UI.register({
        name: 'Tabs / Label',

        scheme: {
            wrap: ''
        },

        params: {
            label: ''
        },

        methods: {
            /**
             * Returns label element.
             * @return {Element}
             */
            getLabel() {
                return this.wrap;
            },

            /**
             * Returns content element.
             * @return {Element}
             */
            getContent() {
                return this.wrap.extension('Tab').params.content;
            }
        },

        onRender(inst, params) {
            inst.wrap.text(params.label);
        }
    });


    /**
     * Label represents content of the tab.
     * Styles may be set in the extending UI.
     */
    UI.register({
        name: 'Tabs / Content',

        scheme: {
            wrap: ''
        }
    });

}
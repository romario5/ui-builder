export default function () {

    /**
     * Add some localization.
     * Any localization can be replaced using L10n.updateTranslation() or L10n.addTranslation() method one more time.
     */
    L10n.addTranslation('modal', {
        ru: {
            'To top': 'Наверх',
            'To bottom': 'Вниз',
            'Loading...': 'Загрузка...'
        }
    });


    /**
     * Simple modal UI.
     * Styles can be set in the extending UI.
     * Basic styles such as position and size will be set in this UI
     * but can be changed by rendering modal with different parameters.
     * To process custom parameters please redefine applyParams() or onRender() event handler.
     */
    UI.register({
        name : 'Modal',

        localization: 'modal',

        translations: {
            label: 'Loading...'
        },

        scheme : {
            wrap : {
                scrollingButtons : {
                    scrollTopButton : '(text = a)',
                    scrollBottomButton : '(text = b)'
                },
                overlay : {
                    closeButton : '(html = ✕)',
                    progressBar: {
                        label: '',
                        track: {
                            bar: ''
                        }
                    },
                    skeleton: '',
                    content : ''
                }
            }
        },

        params : {
            width : '15rem',
            height : '6rem',
            scrollingButtons : true, // If true - scrolling buttons will be shown.
            closeOnBlur : true,      // If true - modal will be closed when user clicks outside the modal.
            closeButton : true,      // If true - closing button (cross icon in the top right corner) will be shown.
            skeleton: '',            // Name of the UI that will be displayed during loading process.

        },

        methods : {
            /**
             * Applies parameters of the modal.
             * May be redefined in the extending UI to implement custom parameters.
             * @param p {Object}
             * @return {Instance}
             */
            applyParams(p) {
                this.overlay.css({
                    width: p.width,
                    minHeight: p.height
                });
                if(!p.closeButton){
                    this.closeButton.hide();
                }

                if(!p.scrollingButtons){
                    this.scrollingButtons.hide();
                }else{
                    this.content.on('load', function () {
                        this.UII().updateScrollingButtons();
                    });

                    this.content.on('renderInside', () => {
                        setTimeout(() => {
                            this.updateScrollingButtons();
                        }, 1000,)
                    });
                }

                if(p.closeOnBlur === true){
                    this.wrap.on('mousedown', (inst, event) => {
                        modalVeilHandler._x = event.clientX;
                        modalVeilHandler._y = event.clientY;
                    });
                    this.wrap.on('click', modalVeilHandler);
                }

                return this;
            },

            /**
             * Sets name of the skeleton UI.
             * @param name {string}
             */
            setSkeleton(name) {
                this.params().skeleton = name;
            },

            /**
             * Renders skeleton UI and shows skeleton container.
             * @return {Instance}
             */
            showSkeleton() {
                let ui = UI(this.params().skeleton);
                if (ui !== null && this.skeleton.children().length === 0) {
                    ui.renderTo(this.skeleton);
                }
                this.skeleton.fadeIn(150, 'flex');
                return this;
            },

            /**
             * Hides skeleton container.
             * @return {Instance}
             */
            hideSkeleton() {
                this.skeleton.fadeOut();
                return this;
            },

            trackProgress(ajax) {
                // Show progress bar and set initial value.
                this.bar.css({width: '10%'});

                this.progressBar.css({display: 'flex', opacity: 1});

                // Set handler to update progress bar on.
                ajax.on('progress', percents => {
                    let w = percents / 100 * this.track.outerWidth();
                    this.bar.animate({width: w + 'px'}, 100);
                });

                this.showSkeleton();

                this.content.css({maxHeight: this.skeleton.outerHeight() + 'px'});

                // Hide progress bar and show content when request will be completed.
                ajax.on('complete', () => {
                    this.bar.css({boxShadow: '0 0 15px ' + Theme('colors.secondary').alpha(0.25).getValue()});
                    setTimeout(() => {
                        this.progressBar.fadeOut(500);
                        this.content.css({maxHeight: 'initial'});
                        this.hideSkeleton();
                        setTimeout(() => {
                            this.progressBar.hide();
                        }, 500);
                    }, 250);
                });

                // Handle ajax errors to properly inform user about it.
                ajax.on('error', (code, event) => {
                    if(event.defaultPrevented){
                        return;
                    }
                    event.preventDefault();
                    this.content.removeChildren();
                    if(code === 404) {
                        UI('Not found message').renderTo(this.content);
                    }else if(code === 403){
                        UI('Forbidden message').renderTo(this.content);
                    }else if(code === 500){
                        UI('Server error message').renderTo(this.content);
                    }
                });
            },

            /**
             * Hides overlay and removes it after animation ends.
             * @return {Instance}
             */
            hide() {
                this.overlay.css({
                    transform: 'scale(1)'
                });
                this.wrap.css({
                    transition: '0.15s'
                });
                setTimeout(() => {
                    this.wrap.removeClass('shown');
                    this.overlay.css({transform: 'scale(1.2)'});
                    this.triggerEvent('hide');
                    this.triggerEvent('close');
                    setTimeout(() => {
                        this.remove();
                    }, 150);
                }, 25);
                return this;
            },

            /**
             * Synonym of hide() method.
             * @return {Instance}
             * @see hide()
             */
            close() {
                this.hide();
            },

            /**
             * Scrolls modal to the bottom.
             * @return {Instance}
             */
            scrollBottom() {
                let p = this.params(),
                    inst = this,
                    initial = this.wrap.scrollTop();
                if(p.ani !== undefined) p.ani.stop();
                p.ani = new Animation({duration: 1000});
                p.ani.run(function (k) {
                    inst.wrap.scrollTop( initial + (inst.wrap.scrollHeight() - inst.wrap.outerHeight() - initial) * k);
                });
                return this;
            },

            /**
             * Scrolls modal to the top.
             * @return {Instance}
             */
            scrollTop() {
                let p = this.params(),
                    inst = this,
                    initial = this.wrap.scrollTop();
                if(p.ani !== undefined) p.ani.stop();
                p.ani = new Animation({duration: 1000});

                p.ani.run(function (k) {
                    inst.wrap.scrollTop(initial + (0 - initial)*k);
                });
            },

            /**
             * Updates buttons depending on the modal height.
             * @return {Instance}
             */
            updateScrollingButtons() {
                if(this.wrap.scrollHeight() <= this.wrap.outerHeight()){
                    this.scrollingButtons.hide();
                }else{
                    this.scrollingButtons.show('flex');
                }
                return this;
            }
        },

        onRender(inst, params) {
            // Apply given parameters.
            inst.applyParams(params);

            // Keep transform origin in center according to the scroll position.
            inst.wrap.addEventListener('scroll', function(inst){
                let p = this.__.node.scrollTop / (this.__.node.scrollHeight - this.__.node.offsetHeight) * 100;
                inst.overlay.css({transformOrigin : 'center ' + parseInt(p) + '%'});
            });

            // Reset transform to the initial value to prevent invalid
            // positioning of the elements inside modal (fixed position works as absolute
            // inside transformed container).
            setTimeout(function(){
                inst.wrap.addClass('shown');
                setTimeout(function(){
                    inst.overlay.css({transform: 'initial'});
                }, 250);
            }, 50);

            inst.closeButton.on('click', modalCloseBtnHandler);
            inst.scrollTopButton.on('click', inst => inst.scrollTop());
            inst.scrollBottomButton.on('click', inst => inst.scrollBottom());
        },

        // Force to load data directly into the content element.
        onLoad(inst, data, event) {
            event.preventDefault();
            inst.content.load(data);
        },

        // Some basic styles.
        styles : {
            '@media print': {
                '.overlay': {
                    boxShadow: 'none'
                }
            },

            wrap : {
                display : 'flex',
                position : 'fixed',
                flexDirection : 'column',
                top : 0,
                left : 0,
                width : '100%',
                height : '100%',
                backgroundColor : 'transparent',
                justifyContent : 'flex-start',
                alignItems : 'center',
                overflowY : 'auto',
                zIndex : 1000,
                transition : '0.75s',

                '.shown' : {
                    backgroundColor : 'rgba(0,0,0,0.25)'
                },

                '.shown > div' : {
                    opacity : 1,
                    transform : 'scale(1)'
                },

                scrollingButtons : {
                    display: 'none',
                    flexDirection: 'column',
                    width: '50%',
                    height: '100%',
                    position: 'fixed',
                    right: '9px',
                    top: 0,

                    ' > *' : {
                        display: 'flex',
                        width: '100%',
                        height: '50%',
                        justifyContent: 'flex-end',
                        color: 'rgba(255,255,255,0.75)',
                        padding: '0.5rem 1rem',
                        fontSize: '1.8rem',
                        fontWeight: 600,
                        fontFamily: 'Icons, sans-serif',
                        transition: '0.25s'
                    },

                    scrollTopButton : {
                        cursor: 'default',
                        alignItems: 'flex-end',
                        backgroundImage: 'linear-gradient(-45deg, rgba(0, 0, 0, 0.15) 7%, rgba(0, 0, 0, 0.05) 7%, rgba(0, 0, 0, 0.05) 10%, transparent 10%)'
                    },

                    scrollBottomButton : {
                        cursor: 'default',
                        backgroundImage: 'linear-gradient(-135deg, rgba(0, 0, 0, 0.15) 7%, rgba(0, 0, 0, 0.05) 7%, rgba(0, 0, 0, 0.05) 10%, transparent 10%)'
                    },

                    ' > *:hover' : {
                        backgroundColor: 'rgba(0,0,0,0.12)'
                    }
                },

                overlay : {
                    display : 'flex',
                    flexDirection : 'column',
                    minWidth : '10rem',
                    maxWidth : 'calc(100% - 2rem)',
                    minHeight : '6rem',
                    backgroundColor : '#ffffff',
                    borderRadius: Theme('overlay.borderRadius').default('0.15rem'),
                    margin : '1rem 0',
                    flexShrink : 0,
                    flexGrow : 0,
                    transform : 'scale(1.2)',
                    opacity : 0,
                    transition : '0.15s',
                    boxShadow : '0 0 1rem rgba(0,0,0,0.25)',
                    position : 'relative',
                    transformOrigin : 'center top',
                    overflow: 'hidden',

                    progressBar: {
                        display: 'none',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 100000,

                        label: {
                            fontWeight: 300,
                            marginBottom: '0.5rem',
                            color: '#555',
                            fontSize: '0.85rem',
                            marginTop: '3rem',
                            display: 'none'
                        },

                        track: {
                            width: '100%',
                            height: '0.25rem',
                            backgroundColor: '#ddd',

                            bar: {
                                width: 0,
                                height: '0.25rem',
                                backgroundColor: Theme('colors.secondary'),
                                transition: '0.15s'
                            }
                        }
                    },

                    '> .buttons' : {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '0.6rem',
                        backgroundColor: Theme('colors.lightestGray')
                    },

                    skeleton: {
                        width: '100%',
                        display: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundColor: '#fff',
                        minWidth: '20rem',
                        zIndex: 99999
                    },

                    content : {
                        display : 'flex',
                        flexDirection : 'column',
                        overflow : 'hidden',
                        transition : '0.15s'
                    },

                    closeButton : {
                        display : 'flex',
                        justifyContent : 'center',
                        alignItems : 'center',
                        width : '2.5rem',
                        lineHeight : '2.5rem',
                        height : '2.5rem',
                        position : 'absolute',
                        top : 0,
                        right : 0,
                        cursor : 'default',
                        zIndex: 5000,

                        ':hover' : {
                            backgroundColor : 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        }
    });

    function modalCloseBtnHandler(overlay) {
        overlay.close();
    }

    function modalVeilHandler(overlay, e) {
        if ( Math.abs(e.clientX - modalVeilHandler._x) > 50 || Math.abs(e.clientY - modalVeilHandler._y) > 50) {
            return;
        }
        if(e.target !== overlay.wrap.__.node) return;
        overlay.close();
    }

    modalVeilHandler._x = 0;
    modalVeilHandler._y = 0;
}

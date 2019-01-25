export default function () {

    /**
     *
     */
    Extension.register('Load more', {
        params: {
            url: '/load-more',
            method: 'GET',
            form: null,
            type: 'from',
            scrollThreshold: 100,
            dummies: 10,
            dummyClass: 'dummy'
        },

        onApply(ext) {
            let cont = ext.target,
                params = ext.params,
                form = params.form,
                type = params.type,
                lastTime = 0,
                lastItemWithNoMore = null,
                dummies = params.dummies || 0,
                dummyClass = params.dummyClass || 'dummy';

            // Create ajax data provider.
            let ajax = new Ajax({
                url: params.url,
                method: params.method,
                allowMultiple: false
            });

            // Flag if it's possible to send request at the moment.
            let ready = true;
            ajax.on('complete', () => ready = true);

            // Remove dummies before loading.
            params.loadHandler = data => {
                if (Array.isArray(data) && data.length > 0) {
                    let dummies = cont.node().getElementsByClassName(dummyClass);
                    for(let i = 0, len = dummies.length; i < len; i++){
                        cont.node().removeChild(dummies[0]);
                    }
                }
            };
            cont.on('load', params.loadHandler);

            // Render new dummies after loading will be finished.
            params.afterLoadHandler = data => {
                // Render dummies.
                if( Array.isArray(data) && data.length > 0 && dummies > 0 ){
                    // Trigger event.
                    cont.triggerEvent('loadMore', data);
                    if(cont.children().length > 0){
                        for(let i = 0; i < dummies; i++){
                            let dummy = document.createElement('div');
                            dummy.className = dummyClass;
                            cont.node().appendChild(dummy);
                        }
                    }
                }
                // If no array loaded - toggle event with empty array to allow user
                // properly handle this situation: show some message or something else.
                cont.triggerEvent('loadMore', []);
            };
            cont.on('afterLoad', params.afterLoadHandler);

            params.handler = () => {
                // Calculate percents of the scroll position.
                let percents = cont.scrollTop() / (cont.scrollHeight() - cont.outerHeight()) * 100;

                // Get last item in the target.
                let items = cont.children();
                let lastItem = items[items.length - 1];

                // If scroll position percents exceeds threshold - try to load more.
                if (ready && percents >= params.scrollThreshold && (percents >= 1 || isNaN(percents)) && Date.now() - lastTime >= 250 && lastItemWithNoMore !== lastItem) {

                    // Gather form data.
                    let params = form === null || form === undefined ? {} : form.gatherData(true);

                    if(type === 'from'){
                        // Last item must implement "Identified" interface in the "from" mode.
                        if (lastItem.isImplementationOf('Identified')) {
                            params.from = lastItem.getId();
                        }else{
                            UI.error('Extension "' + ext.name + '": Last item doesn\'t implement "Identified" interface:', "\n\n", Interface('Identified').toString(), "\n ");
                            return;
                        }
                    }else{
                        params.offset = cont.children().length;
                    }

                    ready = false;
                    lastTime = Date.now();

                    // Load data.
                    ajax.params(params).fetch(function(response){
                        lastTime = Date.now();
                        if( ! Array.isArray(response) ) return;
                        if(response.length === 0){
                            lastItemWithNoMore = lastItem;
                        }
                        cont.load(response, false, false);
                    });
                }
            };
            cont.on('scroll', params.handler);
        },

        onRemove(ext) {
            ext.target.off('scroll', ext.params.handler);
            ext.target.off('scroll', ext.params.loadHandler);
            ext.target.off('scroll', ext.params.afterLoadHandler);
        },

        onUpdate(ext, newParams) {

        }
    });

}
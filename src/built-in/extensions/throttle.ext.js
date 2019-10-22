export default function() {

    /**
     * Throttles function with given delay by key.
     *
     * Example of usage:
     *
     * inst.applyExtension('Throttle', {
     *     key: 'update',
     *     delay: 150,
     *     function: () => { ... }
     * });
     *
     * After some time we can throttle function with this key again:
     *
     * inst.extension('Throttle').update({
     *     key: 'input',
     *     function: () => { ... }
     * });
     */
    Extension.register('Throttle', {
        params: {
            delay: 0,
            event: 'input',
            callback: null
        },

        onApply(ext) { // Define handler and add it as event listener.
            let p = ext.params;
            let to = null;
            let handler = p.callback || p.handler;

            function callback(_this, args) {
                handler.apply(_this, args);
            }

            p.newCallback = function() {
                clearTimeout(to);
                to = setTimeout(callback, p.delay, this, arguments);
            };

            ext.target.on(p.event, p.newCallback);
        },


        onUpdate(ext, newParams) { // Remove old handler and add new one to apply new parameters.
            let params = ext.params;
            let to = null;

            // Remove old handler.
            ext.target.off(params.event, params.newCallback);

            // Copy new parameters.
            for (let p in newParams) {
                if (newParams.hasOwnProperty(p) && params.hasOwnProperty(p)) {
                    params[p] = newParams[p];
                }
            }

            // Define new handler.
            let handler = params.callback || params.handler;

            function callback(_this, args) {
                handler.apply(_this, args);
            }

            params.newCallback = function() {
                clearTimeout(to);
                to = setTimeout(callback, params.delay, this, arguments);
            };

            ext.target.on(params.event, params.newCallback);
        },


        onRemove(ext) { // Remove event handler on extension removing.
            let p = ext.params;
            ext.target.off(p.event, p.newCallback);
        }
    });

}
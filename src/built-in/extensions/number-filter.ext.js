export default function() {

    /**
     * Adds events handlers to the input element or instance to filter input value.
     *
     * Example:
     * inst.price.applyExtension('Number filter', {precision: 2, negative: false});
     */
    Extension.register('Number filter', {
        params: {
            fractional: true,
            negative: true,
            precision: 4,
            min: false,
            max: false
        },

        onApply(ext) {
            let target = ext.target,
                params = ext.params;

            if (!UI.isElement(target) && (UI.isInstance(target) && !target.isImplementationOf('Input'))) {
                UI.error('Extension "' + ext.name + '": target doesn\'t implement "Input" interface:', "\n\n", Interface('Input').toString(), "\n ");
                return;
            }

            params.inputHandler = function() {
                let val = this.val().trim().replace(',', '.').replace(/[^\d.-]/gi, '');

                if (val.length === 0) {
                    this.val('');
                    return;
                }

                let arr = val.split('.');


                if (arr.length > 2) {
                    arr = arr.slice(0, 2);
                }

                if (params.fractional && params.precision > 0) {
                    if (arr.length > 1) {
                        arr[1] = arr[1].slice(0, params.precision - 1);
                    }
                }else {
                    arr = [arr[0]];
                }

                if (arr[0][0] === '.') {
                    arr[0] = '0' + arr[0];
                }

                if (params.negative && arr[0][0] === '-') {
                    arr[0] = '-' + arr[0].slice(1).replace(/[^\d]/g, '');
                }else{
                    arr[0] = arr[0].replace('-', '');
                }

                if (arr[0] !== '-') {
                    val = parseFloat(arr.join('.'));

                    if (isNaN(val) || (params.min !== false && val < params.min)) {
                        val = params.min;
                    }

                    if (params.max !== false && val > params.max) {
                        val = params.max;
                    }
                } else {
                    val = arr.join('.');
                }


                this.val(val);
                this.focus();
            };

            params.changeHandler = function () {
                let val = this.val().trim().replace(',', '.').replace(/[^\d.-]/gi, '');
                if (val[val.length - 1] === '.') {
                    val = val.slice(0, -1);
                    this.val(val);
                }
            };
            target.on('input', params.inputHandler);
            target.on('change', params.changeHandler);
        },

        onRemove(ext) {
            ext.target.off('input', ext.params.inputHandler);
            ext.target.off('change', ext.params.changeHandler);
        }
    });

}
/**
 * Extension that adds validate method to the element.
 *
 * Example:
 * ...
 * onRender : function(inst, params) {
 *     Extension('Validation').applyTo(inst.form, {
 *         validator : new Validator({
 *             login : ['required', 'email'],
 *             pass : ['required', 'string']
 *         }),
 *         informAs : 'alert'
 *     });
 * },
 * ...
 *
 * @event apply
 */
Extension.register({
    name: 'Validation',

    validate : function() {
        var data = this.target.gatherData(),
            errors = this.params.validator.validate(data),
            keys = Object.keys(errors);

        if(keys.length > 0){
            if(this.params.informVia === 'alert'){
                alert(errors[keys[0]]);
            }else if(typeof this.params.informVia === 'function'){
                this.params.informVia(errors);
            }
        }
    }
});
/**
 * Validator is an object that holds information about fields and
 * their checkers (functions that do data validation for the single value depending on the
 * their rules or conditions).
 *
 * Example:
 *
 * // Define custom checker that ensures that username is free.
 * Validator.registerCheck('freeUsername', function(data, success, fail) {
 *     let ajax = new Ajax({url: '/auth/check-username', data: {username: data});
 *     ajax.send(res => if (res === '') success() else fail());
 * });
 *
 * // Create new validator.
 * let validator = new Validator({
 *     username: 'min:6|max:16|freeUsername',
 *     password: 'min:8|max:16|containsNumbers|containsUppercase'
 * });
 *
 * inst.registerButton.on('click', inst => {
 *     let data = inst.gatherData();
 *     validator.check(data, success => {
 *         if (success) {
 *             inst.sendRegistrationRequest(data);
 *         } else {
 *             inst.showError(validator.getFirstError());
 *        }
 *     });
 * });
 *
 */


let checks = {};


export default class Validator
{
    constructor(rules) {
        this.rules = {};
        this.errors = {};

        // Parse rules and save it in the [rules] property.
        for (let p in rules) {
            if (rules.hasOwnProperty(p)) {
                let checks = rules[p].split('|');
                for (let i = 0; i < checks.length; i++) {
                    let arr = checks[i].split(':');
                    if (arr.length === 0) continue;
                    checks[i] = {[arr[0]]: arr.length > 1 ? arr[1] : null};
                }
                this.rules[p] = checks;
            }
        }
    }

    /**
     * Validates given data.
     * @param data {object}
     * @param [callback] {function} callback that will be called with the validation result passed as the argument.
     * @return {boolean}
     */
    validate(data, callback) {

    }

    /**
     * Returns error message for the first invalid field.
     * @return string
     */
    getFirstError() {

    }

    /**
     * Returns first invalid field name.
     * @return string
     */
    getFirstInvalidField() {

    }

    /**
     * Removes all errors for all fields.
     */
    clearErrors() {

    }
}



class Checker
{
    constructor(name, handler) {

    }
}
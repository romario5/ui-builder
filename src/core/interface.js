import {error, warn} from '../utils/logging';
import addEventsMethods from '../utils/events-methods';
import Settings from './settings';
import uiRegistry from '../registries/ui-registry';

/**
 * Interface that holds information about methods set.
 * Main purpose - dependency description.
 *
 * @property name {string}      Name of the interface.
 * @property methods {{Method}} Methods of the interface.
 */
class Interface
{
    constructor(name, methods) {
        this.name = name;
        this.methods = {};
        this.methodsQuantity = 0;

        for (let i = 0, len = methods.length; i < len; i++) {
            let method = new Method(methods[i]);
            if (method.valid) {
                this.methods[method.name] = method;
                this.methodsQuantity++;
            }
        }
    }

    /**
     * Checks if given object implements interface.
     * @param obj {object} Object which methods will be checked.
     * @return {boolean}   Returns true if given object has all interface methods.
     */
    implementedBy(obj) {
        for (let p in this.methods) {
            if (this.methods.hasOwnProperty(p)) {
                if (typeof obj[p] !== 'function' || !this.methods[p].checkSignature(obj[p])) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Interface string representation.
     * @return {string}
     */
    toString() {
        let res = this.name + " {\n";
        for (let p in this.methods) {
            if (this.methods.hasOwnProperty(p)) {
                res += '    ' + p + '(' + this.methods[p].arguments.join(', ') + ")\n";
            }
        }
        return res + "}";
    }
}


let signatureRegexp = /^([\w$_]+[$\w\d]*)\s*\(([\w\d\s,$]*)\)/i;

/**
 * Class that represents single method.
 * Holds information about method name and accepted arguments.
 *
 * @property valid {boolean}      Flag if given signature is valid.
 * @property name {string}        Name of the method.
 * @property arguments {{string}} List of the accepted arguments.
 */
class Method
{
    constructor(signature) {
        this.valid = true;

        let res = (signature + '').match(signatureRegexp);
        if (res === null || res.length < 2) {
            error('Invalid method signature.');
            this.valid = false;
            return;
        }

        this.name = res[1];
        if (res.length > 2) {
            this.arguments = res[2].split(',');
            for (let i = 0, len = this.arguments.length; i < len; i++) {
                this.arguments[i] = this.arguments[i].trim();
                if (this.arguments[i] === '') {
                    this.arguments.splice(i, 1);
                }
            }
        }
    }

    /**
     * Checks if signature of the given function is the same with method's one.
     * @param func {function} Function that will be checked.
     * @return {boolean}
     */
    checkSignature(func) {
        let res = (func + '').match(signatureRegexp);

        if (res === null || res.length < 2) {
            return false;
        }

        if (this.arguments.length > 0) {
            // If function don't accepts arguments but at least one argument required.
            if (res.length < 3) {
                return false;
            }

            // If function accepts too few arguments.
            let args = res[2].split(',');
            if (res[2] === '' || this.arguments.length > args.length) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Object that stores all registered interfaces.
 * @type {{Interface}}
 */
let interfaces = {};

/**
 * Object that stores UIs that implements any interface.
 * The key is interface name and the value is UI.
 * Used for searching of the UI by the interface name.
 * @type {{}}
 */
let interfacesUIs = {};

/**
 * Returns interface by name.
 * @param name {string} Name of the interface.
 * @return {Interface|null}
 * @method triggerEvent(eventName, args)
 * @method on(eventName, handler)
 */
export default function interfaceManager (name) {
    if (interfaces.hasOwnProperty(name)) {
        return interfaces[name];
    }
    return null;
}

// Add events support.
addEventsMethods(interfaceManager);

/**
 * Returns implementation of the interface with given name.
 * @param interfaceName {string}
 * @return {*}
 */
interfaceManager.getImplementation = function(interfaceName) {
    if (interfacesUIs.hasOwnProperty(interfaceName) && interfacesUIs[interfaceName].length > 0) {
        return interfacesUIs[interfaceName][0];
    }
    return null;
};

/**
 * Adds interface implementation.
 * @param interfaceName
 * @param ui
 */
interfaceManager.addImplementation = function(interfaceName, ui) {
    if (!interfacesUIs.hasOwnProperty(interfaceName)) {
        interfacesUIs[interfaceName] = [];
    }
    if (interfacesUIs[interfaceName].indexOf(ui) < 0) {
        interfacesUIs[interfaceName].push(ui);
    }
};

/**
 * Registers new interface.
 * @param name {string} Name of the interface.
 * Please don't use prefix or suffix 'interface'.
 * Any interface will be fetched by using global Interface function-helper.
 * Good name example: Calendar
 *
 * Example of usage:
 *
 * Interface.register('Calendar', [
 *     'val(value)',
 *     'format(template)',
 *     'from(date)',
 *     'to(date)'
 * ]);
 *
 * // Getting 'Calendar' interface using global function-helper.
 * let i = Interface('Calendar');
 *
 * // Defining UI to require this interface:
 * UI.register({
 *     name: 'Date picker',
 *
 *     scheme: {
 *         wrap: {
 *             field: '@input [type = text]',
 *             popup: '<<< Calendar
 *         }
 *     },
 *
 *     dependencies: {
 *         popup: 'Calendar'
 *     }
 * });
 *
 * @param methods
 * @fires interfaceManager:register
 */
interfaceManager.register = function (name, methods) {
    name = name.trim();
    if (typeof name !== 'string' || name === '') {
        error('Interface name is invalid.');
        return;
    }

    if (!Array.isArray(methods) || methods.length === 0) {
        error('Interface method must contain at least one method signature.');
        return;
    }

    if (interfaces.hasOwnProperty(name)) {
        warn('Interface with name "' + name + '" is already registered.');
        return;
    }

    interfaces[name] = new Interface(name, methods);

    // Trigger 'register' event only in development mode because
    // this event initiate implementations searching that costs some performance.
    if (Settings.devMode) {
        interfaceManager.triggerEvent('register', interfaces[name]);
    }
};


/**
 * Returns names of the interfaces that are implemented by the given object.
 * @param obj {object}
 * @return {string[]}
 */
interfaceManager.detectInterfacesFor = function (obj) {
    let res = [];
    for (let p in interfaces) {
        if (interfaces.hasOwnProperty(p)) {
            if (interfaces[p].implementedBy(obj)) {
                res.push(interfaces[p].name);
            }
        }
    }
    return res;
};

// Store link to the uis list.
let uis = uiRegistry.getAll();

/**
 * Handles 'register' event to find implementations of the newly created interface.
 */
interfaceManager.on('register', inter => {
    let implementations = [];
    for (let p in uis) {
        if (uis.hasOwnProperty(p)) {
            if (inter.implementedBy(uis[p].uiiConstructor.prototype)) {
                uis[p].__.implements.push(inter.name);
                implementations.push(uis[p]);
            }
        }
    }
    interfacesUIs[inter.name] = implementations;
});
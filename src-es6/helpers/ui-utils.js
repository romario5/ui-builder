import Settings from '../settings';
import {UIRegistrationException} from '../exceptions';


/**
 * Function used to recursively clone scheme elements into one object (target).
 * Each scheme element not depending on nesting level will be placed directly into the target.
 */
export function cloneSchemeLinear(scheme, target) {
    for (let p in scheme) {
        if(scheme.hasOwnProperty(p)){
            if (typeof scheme[p] === 'object') {
                cloneSchemeLinear(scheme[p], target);
                target[p] = {
                    name : p,
                    rules : '',
                    children: scheme[p]
                };

            } else if (typeof scheme[p] === 'string') {
                target[p] = {
                    name : p,
                    rules : scheme[p],
                    children: null
                };

            }else if(scheme[p] === false){
                delete scheme[p];
            } else {
                throw new InvalidSchemeException('Value of the element must be string or object.');
            }
        }
    }
}



/**
 * Parses element's parameters string into the object.
 * All regular expressions used for parsing available in the settings.
 */
export function parseParameters(str) {
    let _result = {};

    // Parse parameters.
    _result.parameters = {};
    let prm = str.match(Settings.regexp_params);
    str = str.replace(Settings.regexp_params, '');

    // Get parameters array
    prm = (prm !== null && prm.length > 0) ? prm[0].slice(1, -1) : '';  // Cut the brackets.
    prm = prm.split(';');

    // Put parameters into the result.
    for (let i = 0; i < prm.length; i++) {
        p = prm[i].split('=');
        if (p.length === 2) {
            if (p[0].trim() === '') continue;
            _result.parameters[p[0].trim()] = p[1].trim();
        }
    }

    // Parse attributes.
    _result.attributes = {};

    // Get attributes array.
    let att = str.match(Settings.regexp_attribute);
    str = str.replace(Settings.regexp_attribute, '');
    att = (att !== null && att.length > 0) ? att[0].slice(1, -1) : ''; // Cut the brackets.
    att = att.split(';');

    // Put attributes into the result.
    let p;
    for (let i = 0; i < att.length; i++) {
        p = att[i].split('=');
        if (p.length === 2) {
            if (p[0].trim() === '') continue;
            _result.attributes[p[0].trim()] = p[1].trim();
        }
    }



    // Parse properties.
    _result.properties = {};
    let pr = str.match(Settings.regexp_property);
    str = str.replace(Settings.regexp_property, '');

    // Get properties array
    pr = (pr !== null && pr.length > 0) ? pr[0].slice(1, -1) : '';  // Cut the brackets.
    pr = pr.split(';');

    // Put properties into the result.
    for (let i = 0; i < pr.length; i++) {
        p = pr[i].split('=');
        if (p.length === 2) {
            if (p[0].trim() === '') continue;
            _result.properties[p[0].trim()] = p[1].trim();
        }
    }



    // Define tag name, id, class and child UI using regular expressions.
    _result.tag = str.match(Settings.regexp_tagName);
    _result.id = str.match(Settings.regexp_id);
    _result.class = str.match(Settings.regexp_class);
    _result.child = str.match(Settings.regexp_childUI);
    _result.include = str.match(Settings.regexp_include);

    // Cut special characters from the start.
    if (_result.tag !== null) _result.tag = _result.tag[0].slice(1).trim();
    if (_result.id !== null) _result.id = _result.id[0].slice(1).trim();
    if (_result.class !== null) _result.class = _result.class[0].slice(1).trim();
    if (_result.child !== null) _result.child = _result.child[0].slice(1).trim();
    if (_result.include !== null) _result.include = _result.include[0].slice(3).trim();

    return _result;
}




/**
 * Recursively builds scheme into the target (UIElement or DOM node).
 * @param instance (UIInstance) - New instance of the UI.
 * @param ui (UI) - UI which is building.
 * @param scheme (object) -
 * @param target (node|UIElement)
 * @param atStart (boolean)
 */
export function buildScheme(instance, ui, scheme, target, atStart) {

    // Set default atStart value if it's not specified.
    if (typeof atStart !== 'boolean') atStart = false;

    // Throw error if instance is not exemplar of the UIInstance.
    if (instance instanceof UIInstance === false)
        throw new RenderingException('Second argument must be an UIInstance.');

    // Throw error if ui is not exemplar of the UI.
    if (ui instanceof UI === false)
        throw new RenderingException('Second argument must be an UI.');

    let params;     // Parameters of the single element (UIElement).
    let targetNode; // Node in which element will be placed.

    if (typeof scheme === 'object') {
        for (let elementName in scheme) {
            if(!scheme.hasOwnProperty(elementName)) continue;

            // Skip if element with the same name already exists.
            if (instance.hasOwnProperty(elementName)) continue;

            // Parse parameters for new element.
            if (typeof scheme[elementName] === 'string') {
                params = parseParameters(scheme[elementName]);
            } else if (typeof scheme[elementName] === 'object') {
                if (ui.rules.hasOwnProperty(elementName)) {
                    params = parseParameters(ui.rules[elementName]);
                } else {
                    params = {
                        id: null,
                        class: makeClassName(elementName),
                        tag: 'div',
                        child: null,
                        include: null,
                        attributes: {},
                        properties: {},
                        parameters: {}
                    };
                }
            }

            // Make default class if not set.
            if (params.class === '' || params.class === null) {
                params.class = makeClassName(elementName);
            }

            let uiClass = makeClassName(ui.name);
            if (ui.scheme === scheme && params.class !== uiClass) {
                params.class = uiClass + ' ' + params.class;
            }

            params.name = elementName;

            // Create element.
            let element = new UIElement(params);
            element.__.uiinstance = instance;
            element.__.node.uiinstance = instance;

            // Render another UI if include is detected.
            if (params.include !== null) {
                let inclusionUI = _uibuilder(params.include);
                if (inclusionUI !== null) {
                    for(let p in inclusionUI.__.params){
                        if(!params.parameters.hasOwnProperty(p) && inclusionUI.__.params.hasOwnProperty(p)){
                            params.parameters[p] = inclusionUI.__.params[p];
                        }
                    }
                    element.__.inclusion = element.add(inclusionUI, params.parameters);
                } else {
                    throw new RenderingException('Required for including UI "' + params.include + '" is not registered yet.');
                }
            }

            if( instance.__.localization !== null
                && instance.__.translations !== null
                && instance.__.translations.hasOwnProperty(element.__.name)
            ){
                if(element.__.inclusion === null){
                    element.__.node.setAttribute('localization', instance.__.localization);
                    element.__.node.T = instance.__.translations[element.__.name];
                }else{
                    element.__.inclusion.triggerEvent('localization', instance.__.localization, instance.__.translations[element.__.name]);
                }
            }

            // Attach element into instance.
            instance[elementName] = element;

            if(ui.translations.hasOwnProperty(elementName)){
                let t = L10n.getTranslations(ui.localization);
                if(element.__.node.tagName === 'INPUT'){
                    element.attr('placeholder', t(ui.translations[elementName]));
                }else if(element.__.inclusion === null){
                    element.text(t(ui.translations[elementName]))
                }
            }

            // Set parent UIElement and define target node.
            if (target instanceof UIElement) {
                element.__.parent = target;
                target[elementName] = element;
                targetNode = target.__.node;
            } else if (typeof target === 'string') {
                targetNode = document.querySelector(target);
            } else {
                targetNode = target;
            }

            // Append element to the container node.
            if (atStart) {
                let first = targetNode.firstChild;
                if (first !== null) {
                    targetNode.insertBefore(element.__.node, first);
                } else {
                    targetNode.appendChild(element.__.node);
                }
            } else {
                targetNode.appendChild(element.__.node);
            }

            // Add nested schemes.
            if (typeof scheme[elementName] === 'object') {
                buildScheme(instance, ui, scheme[elementName], element);
            }
        }
    }
}



/**
 * Filters UI parameter:
 * - converts 'true' or 'false' to corresponding boolean value.
 * - converts 'null' to null value.
 * - parses string with numbers to the corresponding number value.
 */
export function filterUIParameterValue(value)
{
    let numberRegexp = /^\d+(\.?\d+)?$/i;

    if(value === 'null'){
        value = null;
    }else if(value === 'true'){
        value = true;
    }else if(value === 'false'){
        value = false;
    }else if(numberRegexp.test(value)){
        value = Number(value);
    }

    return value;
}



/**
 * Checks parameters that given on the UI registration.
 */
export function checkUIParameters(data)
{
    if (!data.hasOwnProperty('name'))
        throw new UIRegistrationException('Name of a new UI is not defined.');

    if (typeof data.name !== 'string')
        throw new UIRegistrationException('Name of a new UI is ' + (typeof data.name) + '. String required.');

    if (uiList.hasOwnProperty(data.name))
        throw new UIRegistrationException('UI with name "' + data.name + '" already registered.');

    if (!data.hasOwnProperty('scheme')) data.scheme = {};

    if (typeof data.scheme !== 'object')
        throw new UIRegistrationException('Scheme for a new UI "' + data.name + '" is ' + (typeof data.scheme) + '. Object required.');

    if (!data.hasOwnProperty('rules')) data.rules = {};

    if (typeof data.rules !== 'object')
        throw new UIRegistrationException('Rules for a new UI "' + data.name + '" is ' + (typeof data.rules) + '. Object required.');
}

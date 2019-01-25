import {parseParameters} from '../utils/ui-utils';
import {makeClassName} from '../utils/strings';

let cssGenerator = {
    generateUIStyles (ui) {
        return generateCSS.call(ui, ui.css);
    },

    generateSimpleStyles (styles) {
        let css = "\n";
        for(let p in styles){
            if(styles.hasOwnProperty(p)){
                if(typeof styles[p] !== 'object'){
                    continue;
                }
                css += p + " {\n";
                for(let s in styles[p]){
                    if(styles[p].hasOwnProperty(s)){
                        let val = styles[p][s];
                        if(val.getValue !== undefined){
                            val = val.getValue();
                        }
                        css += '    ' + makeClassName('' + s) + ': ' + val + ";\n";
                    }
                }
                css += "}\n";
            }
        }
        return css;
    }
};

export default cssGenerator;

/**
 * Generates CSS of the UI.
 * @returns {string}
 */
function generateCSS (data, parentSelector, parentEl)
{
    if(parentSelector === undefined) parentSelector = '';
    let res = [];

    for(let elName in data) {
        if(!data.hasOwnProperty(elName)) continue;

        let styles = data[elName];
        let cssText = '';
        let selector, params;

        // Check if element exists in the UI.
        if (!this.elements.hasOwnProperty(elName) && elName[0] === '@') {

            // Process CSS animation.
            if(elName.slice(0, 10) === '@keyframes'){
                cssText += elName + "{\n";
                for (let p in styles) {
                    if(!styles.hasOwnProperty(p)) continue;
                    if (typeof styles[p] === 'string') {
                        cssText += '    ' + makeClassName(p) + ': ' + (styles[p] === '' ? '""' : styles[p]) + ";\n";
                    } else if (typeof styles[p] === 'object') {
                        let value = '    ' + p + " {\n";
                        for (let s in styles[p]) {
                            if(styles[p].hasOwnProperty(s)){
                                value += '        ' + makeClassName(s) + ': ' + styles[p][s] + ";\n";
                            }
                        }
                        value += "    }\n";
                        cssText += value;
                    }
                }
                cssText += "}\n";
                res.push(cssText);

                // Otherwise generate nested styles in case it is media query, print or something else.
            }else if(typeof styles === 'object'){
                cssText += parentSelector + elName + "{\n";
                cssText += generateCSS.call(this, styles);
                cssText += "}\n";
                res.push(cssText);
            }
            continue;
        }

        // Make selector.
        if(this.elements.hasOwnProperty(elName)){
            params = parseParameters(this.elements[elName].rules);
            selector = params.id !== null ? '#' + params.id : '.' + (params.class !== null ? params.class.split(' ').join('.') : makeClassName(elName));
            selector = (this.elements.hasOwnProperty(parentEl) && this.elements[parentEl].children.hasOwnProperty(elName) ? ' > ' : ' ') + selector;
        }else{
            selector = makeClassName(elName);
        }

        // Make root selector to encapsulate styles in the instance UI.
        let rootSelector = makeClassName(this.name);
        let root = this.getRootElement();
        if(root !== null){
            params = parseParameters(root.rules);
            let rootClass = params.class !== null ? params.class.split(' ').join('.') : makeClassName(root.name);
            if(root === this.elements[elName]){
                selector = '';
            }
            rootSelector = params.id !== null ? '#' + params.id : '.' + makeClassName(this.name) + '.' + rootClass;
        }
        // Don't use root selector if it already presented.
        if(parentSelector.indexOf(rootSelector) >= 0 || selector.indexOf(rootSelector) >= 0) rootSelector = '';

        let index = res.length;
        res.push('');

        cssText += ((rootSelector + ' ' + parentSelector).trim() + selector)
                .replace('  ', ' ')
                .replace(' :', ':')
                .replace('>:', ':') + "{\n";

        for(let styleName in styles){
            if(!styles.hasOwnProperty(styleName)) continue;

            let style = styles[styleName];

            if(typeof style === 'string' || typeof style === 'number'){
                let s = style;
                if(styleName === 'content'){
                    s = style.slice(0, 5) === 'attr(' ? style : (style === '' ? '""' : '"'+style+'"');
                }
                cssText += '    ' + makeClassName(styleName) + ': ' + s + ";\n";

            }else if(style.getValue !== undefined){
                cssText += '    ' + makeClassName(styleName) + ': ' + style.getValue() + ";\n";

            }else if(typeof style === 'object'){
                let obj = {};
                obj[styleName] = style;
                res.push(generateCSS.call(this, obj, parentSelector + selector, elName));
            }
        }
        cssText += "}\n";
        res[index] = cssText;
    }
    return res.join("\n");
}
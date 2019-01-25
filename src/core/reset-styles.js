import cssGenerator from './css-generator';

/**
 * Reset styles.
 * @type {{}}
 */
let resetStyles = {};

/**
 * Generates reset styles.
 * Can be used after theme definition to include dynamically defined styles.
 *
 * Example:
 *
 * // Define theme.
 * Theme.register('Default', {
 *     colors : {
 *         primary: new Color('#ff0000)
 *     }
 * });
 *
 * // Set current theme.
 * Theme.switchTo('Default');
 *
 * // Add reset styles and render it.
 * UI.createResetStyles({
 *     button : {
 *         backgroundColor: Theme('colors.primary')
 *     }
 * });
 *
 * // Force to re-render reset styles on theme switch.
 * Theme.on('switch', UI.createResetStyles);
 */
export default function createResetStyles (styles)
{
    if(styles === undefined){
        styles = resetStyles;
    }else{
        resetStyles = styles;
    }

    let styleTag = document.querySelector('style[data-reset="ui-builder"]');
    if(styleTag === null){
        styleTag = document.createElement('style');
        styleTag.setAttribute('data-reset', 'ui-builder');
        let head = document.getElementsByTagName('head')[0];
        head.appendChild(styleTag);
    }

    // Set new content of the reset style tag.
    styleTag.innerHTML = cssGenerator.generateSimpleStyles(styles);
};
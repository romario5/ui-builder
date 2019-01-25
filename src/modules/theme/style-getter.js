/**
 * Class that represents some style from the theme.
 * This class is used of tell UI that some style property will be change depending on the theme.
 * Also it provides style changing "on the fly" functionality.
 *
 * Usage example:
 *
 * styles: {
 *     wrap: {
 *         color: Theme('colors.primary').darker(10).default('#5887f4')
 *     }
 * }
 */
export default class StyleGetter
{
    constructor(name) {
        this.name = name;
        this._darker = 0;
        this._lighter = 0;
        this._alpha = undefined;
        this._default = 'initial';
    }

    /**
     * Returns value of the style.
     * Also applies color changes.
     * @return {string}
     */
    getValue() {
        let value = Theme.getStyle(this.name);
        if(value instanceof Color){
            let c = new Color(value.toRgbaString());
            if(this._darker > 0) c.darker(this._darker);
            if(this._lighter > 0) c.lighter(this._lighter);
            value = c.toRgbaString(this._alpha);
        }
        if(value === null){
            return this._default;
        }
        return value;
    }

    /**
     * Sets transparency of the color style.
     * @param value {number} Transparency amount (from 0 to 1).
     * @return {StyleGetter}
     */
    alpha(value) {
        this._alpha = value;
        return this;
    }

    /**
     * Makes color style darker for the amount.
     * @param amount {number} How darker color will become (from 0 to 100).
     * @return {StyleGetter}
     */
    darker(amount) {
        this._darker += amount;
        return this;
    }

    /**
     * Makes color style lighter for the amount.
     * @param amount {number} How lighter color will become (from 0 to 100).
     * @return {StyleGetter}
     */
    lighter(amount) {
        this._lighter += amount;
        return this;
    }
}

/**
 * Sets default value of the style if it will be absent in the theme.
 * Always use this method to prevent errors or unwanted appearance on theme switching.
 * @param value {string}
 * @return {StyleGetter}
 */
StyleGetter.prototype.default = function(value) {
    this._default = value;
    return this;
};
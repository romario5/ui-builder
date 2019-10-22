/**
 * Splits string bu upper case.
 * @para {string} str
 * @return {Array}
 */
export function splitByUpperCase(str) {
    return str.replace(/([A-Z]+)/g, ",$1")
        .replace(/^,/, '')
        .split(',');
}


/**
 * Formats string to be useful in the "id" or "class" attribute.
 * @param {string} str
 * @return {string}
 */
export function makeClassName(str) {
    return splitByUpperCase(str.replace(/\//g, '_').replace(' - ', '-'))
        .join('-')
        .replace(/([a-zA-Z_-])\s+([a-zA-Z_\-\d])/g, "$1-$2")
        .replace(/\s*-+\s*/gi, '-')
        .replace(/-*_-*/gi, '_')
        .toLowerCase();
}
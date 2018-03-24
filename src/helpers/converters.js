/**
 * Splits string bu upper case.
 * @para {string} str
 * @return {Array}
 */
function splitByUpperCase(str) {
	return str.replace(/([A-Z]+)/g, ",$1").replace(/^,/, '').split(',');
}


/**
 * Formats string to be useful in the "id" or "class" attribute.
 * @param {string} str
 * @return {string}
 */
function makeClassName(str) {
	return splitByUpperCase(str.replace(' - ', '-')).join('-').replace(/([a-zA-Z_-])\s+([a-zA-Z_\-\d])/g, "$1-$2").toLowerCase();
}
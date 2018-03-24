/**       Settings
 * ___________________________
 * ---------------------------
 *
 * Settings object stores options which are used by the framework like RegExp used for parsing, etc.
 * To change some settings it's necessary to use setters which are defined in this section.
 * If you're going to add some settings, please implement setters for it.
 * For handling errors - write your own exception.
 * Settings object is not available as property of exported object. It's private.
 *
 * Available settings:
 * regexp_... - RegExp used for parsing scheme rules. Setter - setParsingRule().
 * If you implements your own settings - add it below.
 */
 

var Settings = {
	// Regular expressions.
	regexp_id: /#\w+[_\-\w]*/ig,
	regexp_tagName: /@\w+[_\-\w]*/ig,
	regexp_class: /\.\w+[_\-\w\s\d]*/ig,
	regexp_attribute: /\[(\w+[_\-\w]*\s*=\s*[^;=]+[/_\-\w\d.\s]*(\s*;\s*)?)+\]/ig,
	regexp_property: /\((\w+[_\-\w]*\s*=\s*[^;=]+[/_\-\w\d.\s]*(\s*;\s*)?)+\)/ig,
	regexp_params: /\{(\w+[_\-\w]*\s*=\s*[^;=]+[#\(\),/_\-\w\d.\s]*(\s*;\s*)?)+\}/ig,
	regexp_childUI: /\|\s*\w*[_\-\w\s/]+[_\-\w\d\s]*/ig,
	regexp_include: /<<<\s*\w*[_\-\w\s]+[_\-\w\d\s]*/ig,

	// Flat that indicates whether logging is enabled.
	logging: true
};


/**
 * Setter of the rules parsing RegExp.
 * @param subjectOrRules (string)
 * @param regularExpression (RegExp | Object)
 * @throws InvalidParsingRuleException
 *
 * Example: UIBuilder.setParsingRule('include', /~\w*[_-\w\s]+/ig);
 */
_uibuilder.setParsingRule = function (subjectOrRules, regularExpression) {
	if (typeof subjectOrRules === 'string') {

		if (!Settings.hasOwnProperty('regexp_' + subjectOrRules))
			throw new SettingsException('Rule "' + subjectOrRules + '" is absent in the settings.');

		if (a.constructor !== RegExp)
			throw new SettingsException('Trying to assign '
				+ typeof regularExpression + ' as parsing regular expression for ' + subjectOrRules + '.'
			);

		Settings['regexp_' + subjectOrRules] = regularExpression;


	} else if (typeof subjectOrRules === 'object') {

		for (var p in subjectOrRules) {

			if (Settings.hasOwnProperty('regexp_' + p)) {
				if (a.constructor !== RegExp)
					throw new SettingsException('Trying to assign '
						+ typeof regularExpression + ' as parsing regular expression for '
						+ subjectOrRules + '.'
					);
				Settings['regexp_' + p] = subjectOrRules[p];

			} else {
				throw new SettingsException('Rule "' + p + '" is absent in the settings.');
			}
		}

	}
};


/**
 * Disables logging if false given.
 * @param {boolean} enable
 */
_uibuilder.enableLogging = function (enable) {
	Settings.logging = enable !== false;
};
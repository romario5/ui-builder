/**
 * @var {string} Current application language.
 */
var language = 'en';


/**
 * Sets interface language.
 * @param {string} lang
 */
_uibuilder.setLanguage = function(lang)
{
    language = lang;
};


/**
 * Returns interface language.
 * @return {string}
 */
_uibuilder.getLanguage = function()
{
    return language;
};


/**
 * Changes application language to the given one.
 * Switches only language.
 * @param lang
 */
_uibuilder.switchLanguageTo = function(lang)
{
    language = lang;
    if(translations.hasOwnProperty(lang)){
        curTranslation = translations[lang];
    }else{
        curTranslation = translations.en;
    }
};




/**
 * Switches language and timezone.
 * @param locale
 */
_uibuilder.switchLocaleTo = function(locale)
{

};


/**
 * Private variable that encapsulates translations.
 * @type {object}
 */
var translations = {
    en : {},
    ru : {},
    es : {},
    de : {},
    pt : {},
    br : {},
    it : {},
    fr : {},
    jp : {},
    ko : {},
    zh : {}
};


var curTranslation = translations.en;


/**
 *
 * @param message
 * @param category
 * @param params
 * @returns {string}
 */
_uibuilder.L10n = function(message, category, params)
{
    return translate(message, category, params);
};


/**
 * Returns translation of the given message.
 * @param {string} message
 * @param {string} [category]
 * @param {object} [params]
 * @returns {string}
 */
function translate(message, category, params)
{
    if(params === undefined && typeof category === 'object'){
        params = category;
    }

    // Find translation.
    var t = curTranslation;
    if(t.hasOwnProperty(category) && t[category].hasOwnProperty(message)){
        message = t[category][message];
    }else{
        _uibuilder.L10n.loadTranslations(category);
    }

    // Replace placeholders like {name} with their value.
    for(var p in params){
        if(params.hasOwnProperty(p)){
            message = message.replace('{' + p + '}', params[p]);
        }
    }

    return message;
}


/**
 * Saves loaded translations.
 * @param category
 * @param data
 */
_uibuilder.L10n.addTranslation = function(category, data)
{
    if( ! translations.hasOwnProperty(category) && typeof data === 'object'){
        translations[category] = data;
    }
};


var translationsLoader = null;


/**
 * Loads translation of the given category using
 * registered translation loader.
 * @param category
 * @returns {boolean}
 */
_uibuilder.L10n.loadTranslations = function(category)
{
    if(translationsLoader === null){
        return false;
    }

    translationsLoader(category);
    return true;
};


/**
 * Registers translation loader if it was not registered yet.
 * @param {function} loader
 */
_uibuilder.L10n.registerTranslationsLoader = function(loader)
{
    if(typeof loader === 'function' && translationsLoader === null){
        translationsLoader = loader;
    }
};
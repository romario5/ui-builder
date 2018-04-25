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
    _uibuilder.switchLanguageTo(lang);
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
    // Trigger 'langchange' event on the global UI object.
    // Any instance or element can listen for this event to update it's translations.
    _uibuilder.triggerEvent('langchange', lang);
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


/**
 * Cache for translators.
 * @type {{CategoryTranslator}}
 */
var translators = {
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
    return translate(curTranslation, message, category, params);
};


/**
 * Returns translation of the given message.
 * @param {object} t
 * @param {string} message
 * @param {string} [category]
 * @param {object} [params]
 * @returns {string}
 */
function translate(t, message, category, params)
{
    if(params === undefined && typeof category === 'object'){
        params = category;
    }

    // Find translation.
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
        for(var lang in translations){
            if(data.hasOwnProperty(lang)){
                translations[lang][category] = data[lang];
            }
        }
    }
};


var translationsLoader = null;


/**
 * Loads translation of the given category using
 * registered translation loader.
 * @param category
 * @param callback
 * @returns {boolean}
 */
_uibuilder.L10n.loadTranslations = function(category, callback)
{
    // Remove leading slash.
    category = category.replace('\\', '/');
    if(category[0] === '/'){
        category = category.slice(1);
    }
    if(translationsLoader === null){
        return false;
    }

    if(curTranslation.hasOwnProperty(category)){
        _uibuilder.triggerEvent('translations', category);
        if(typeof callback === 'function'){
            callback();
        }
        return true;
    }

    translationsLoader(category, callback);
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


/**
 * Returns translator for the given category.
 *
 * Example of usage:
 *
 * var t = L10n.getTranslations('common');
 * button.innerText = t('Save');
 * alert.innerText = t('Do you really want to delete user {name}?', {name: 'John Doe'});
 *
 * @param category
 * @returns {CategoryTranslator}
 */
_uibuilder.L10n.getTranslations = function(category)
{
    if(translators[language].hasOwnProperty(category)){
        return translators[language][category];
    }
    var t = curTranslation;

    if(t.hasOwnProperty(category)){
        t = t[category];
    }

    function CategoryTranslator(message, params)
    {
        if(t.hasOwnProperty(message)){
            message = t[message];
        }
        // Replace placeholders like {name} with their value.
        for(var p in params){
            if(params.hasOwnProperty(p)){
                message = message.replace('{' + p + '}', params[p]);
            }
        }
        return message;
    }

    if(t !== curTranslation){
        translators[language][category] = CategoryTranslator;
    }

    return CategoryTranslator;
};

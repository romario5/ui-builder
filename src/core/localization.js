import addEventsMethods from '../utils/events-methods';
import {warn} from '../utils/logging';

/**
 * @var {string} Current application language.
 */
let language = 'en';


/**
 * Sets interface language.
 * @param {string} lang
 */
L10n.setLanguage = function(lang) {
    switchLanguageTo(lang);
};


L10n.switchLanguageTo = L10n.setLanguage;

/**
 * Returns interface language.
 * @return {string}
 */
L10n.getLanguage = function() {
    return language;
};


/**
 * Changes application language to the given one.
 * Switches only language.
 * @param lang
 */
function switchLanguageTo(lang) {
    language = lang;
    if(translations.hasOwnProperty(lang)){
        curTranslation = translations[lang];
    }else{
        curTranslation = translations.en;
    }

    // TODO langChange event was fired on the global UI object. Make sure that you not use this event or replace it.

    // Trigger 'langChange' event on the global UI object.
    // Any instance or element can listen for this event to update it's translations.
    L10n.triggerEvent('langChange', lang);
}

/**
 * Private variable that encapsulates translations.
 * @type {object}
 */
let translations = {
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
    zh : {},
    ua : {}
};


/**
 * Cache for translators.
 * @type {{CategoryTranslator}}
 */
let translators = {
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
    zh : {},
    ua:  {}
};

/**
 * Current translations.
 * @type {object}
 */
let curTranslation = translations.en;


/**
 * Function-object-helper that encapsulates all localization functionality.
 * Also used for translation messages from any category without getting translator.
 * @param message
 * @param [category]
 * @param [params]
 * @returns {string}
 */
export default function L10n(message, category, params)
{
    return translate(curTranslation, message, category, params);
}

// Add events support for the localization object.
addEventsMethods(L10n);


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
        // If translations absent - try to load it.
        L10n.loadTranslations(category);
    }

    // Replace placeholders like {name} with their value.
    for(let p in params){
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
L10n.addTranslation = function(category, data)
{
    if( ! translations.hasOwnProperty(category) && typeof data === 'object'){
        for(let lang in translations){
            if(data.hasOwnProperty(lang)){
                translations[lang][category] = data[lang];
            }
        }
    }
};

/**
 * Function that will loads translations.
 * Can be replaced with user-defined one.
 * @type {function|null}
 */
let translationsLoader = defaultTranslationsLoader;

/**
 * Path with localization files.
 * @type {string}
 */
let localizationsPath = '/localizations';

/**
 * Sets path with localization files.
 * @param path {string}
 */
L10n.setLocalizationsPath = function(path) {
    localizationsPath = path;
};

/**
 * Returns path of the localizations that was specified by setLocalizationsPath() method.
 * @return {string}
 */
L10n.getLocalizationsPath = function() {
    return localizationsPath;
};

/**
 * Default localization loader.
 * @param category
 * @param callback
 */
function defaultTranslationsLoader(category, callback) {
    let ajax = new DataAjax({
        url: (localizationsPath + '/' + category + '.json').replace('//', '/'),
        method: 'GET'
    });
    ajax.fetch(function(data){
        L10n.addTranslation(category, data);
        L10n.triggerEvent('translations', category);
        if(typeof callback === 'function'){
            callback();
        }
    });
}

/**
 * Object that holds information about currently loading translations.
 * @type {{}}
 */
let currentlyLoading = {};

/**
 * Functions that will be called after corresponding translations will be loaded.
 * @type {{}}
 */
let translationsLoadingCallbacks = {};

/**
 * Listen for category complete loading and run corresponding callbacks.
 * @see translationsLoadingCallbacks
 */
L10n.on('categoryLoaded', function(t, cat) {
    if(translationsLoadingCallbacks.hasOwnProperty(cat)){
        let callbacks = translationsLoadingCallbacks[cat];
        for(let i = 0; i < callbacks.length; i++){
            if(typeof callbacks[i] === 'function') callbacks[i](t);
        }
    }
    delete translationsLoadingCallbacks[cat];
});

/**
 * Loads translation of the given category using
 * registered translation loader.
 * @param category
 * @param [callback]
 * @returns {boolean}
 */
L10n.loadTranslations = function(category, callback)
{
    // Remove leading slash.
    category = category.replace('\\', '/');
    if(category[0] === '/'){
        category = category.slice(1);
    }

    // If category is loading at the moment - add callback to the handlers queue.
    // Pay attention that we skip checking for callback existence because this situation
    // probably will not be occurred.
    if(currentlyLoading[category] === true){
        if(!translationsLoadingCallbacks.hasOwnProperty(category)){
            translationsLoadingCallbacks[category] = [];
        }
        if (typeof callback === 'function') {
            translationsLoadingCallbacks[category].push(callback);
        }
        return true;
    }

    // If loader is not specified yet - return false and log warning.
    if(translationsLoader === null){
        warn('Translations loader is not specified.');
        return false;
    }

    // If translations already loaded - return.
    if (curTranslation.hasOwnProperty(category)) {
        if(typeof callback === 'function'){
            let t = L10n.getTranslations(category);
            callback(t);
        }
        return true;
    }

    // Mark that category is loading yet.
    currentlyLoading[category] = true;

    // Disable flag after 10 seconds to allow script to retry.
    let to = setTimeout(function() {
        delete currentlyLoading[category];
    }, 10000);

    // Runt translations loader.
    translationsLoader(category, function(){
        delete currentlyLoading[category];
        clearTimeout(to);
        let t = L10n.getTranslations(category);

        if (translationsLoadingCallbacks.hasOwnProperty(category) && Array.isArray(translationsLoadingCallbacks[category])) {
            for (let i = 0; i < translationsLoadingCallbacks[category].length; i++) {
                translationsLoadingCallbacks[category][i](t);
            }
            delete translationsLoadingCallbacks[category];
        }

        L10n.triggerEvent('categoryLoaded', t, category);
        if(typeof callback === 'function') {
            callback(t);
        }
    });

    return true;
};

/**
 * Registers translation loader if it was not registered yet.
 * @param {function} loader
 */
L10n.registerTranslationsLoader = function(loader)
{
    if(typeof loader === 'function' && (translationsLoader === null || translationsLoader === defaultTranslationsLoader)){
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
L10n.getTranslations = function(category) {
    if (!translators.hasOwnProperty(language)) {
        translators[language] = {};
    }
    if(translators[language].hasOwnProperty(category)){
        return translators[language][category];
    }
    let t = curTranslation;

    if(t.hasOwnProperty(category)){
        t = t[category];
    }

    function CategoryTranslator(message, params)
    {
        if(t.hasOwnProperty(message)){
            message = t[message];
        }
        // Replace placeholders like {name} with their value.
        for(let p in params){
            if(params.hasOwnProperty(p)){
                message = message.replace('{' + p + '}', params[p]);
            }
        }
        return message;
    }

    CategoryTranslator.getAll = function() {
        return t;
    };

    if(t !== curTranslation){
        translators[language][category] = CategoryTranslator;
    }

    return CategoryTranslator;
};


/**
 * Updates translations for all interface.
 */
function updateTranslations()
{
    let items = document.querySelectorAll('*[localization]');
    for(let i = 0; i < items.length; i++){
        if(items[i].T !== undefined) {
            let cat = items[i].getAttribute('localization');
            let t = L10n.getTranslations(cat);
            if(items[i].tagName === 'INPUT'){
                items[i].setAttribute('placeholder', t(items[i].T));
            }else{
                items[i].innerText = t(items[i].T);
            }
        }
    }
}


/**
 * Updates translations for the interface with specific localization category.
 * @param category {string}
 */
function updateTranslationsByCategory(category)
{
    let t = L10n.getTranslations(category);
    let items = document.querySelectorAll('*[localization="' + category + '"]');
    for(let i = 0; i < items.length; i++){
        if(items[i].T !== undefined) {
            if(items[i].tagName === 'INPUT'){
                items[i].setAttribute('placeholder', t(items[i].T));
            }else{
                items[i].innerText = t(items[i].T);
            }
        }
    }
}


L10n.on('langChange', updateTranslations);
L10n.on('translations', updateTranslationsByCategory);
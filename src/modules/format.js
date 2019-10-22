import L10n from '../core/localization';

export default function Format(value){
    return Format.date(value);
}


/**
 * Formats number as ordinal.
 * The value will be converted to integer.
 * @param {number} value
 * @returns {string}
 */
Format.ordinal = function (value) {
    value = parseFloat(value);
    let ends = ['th','st','nd','rd','th','th','th','th','th','th'];
    if (((value % 100) >= 11) && ((value % 100) <= 13))
        return value + 'th';
    else
        return value + ends[value % 10];
};

/**
 * @param {number} month
 * @param {string} [lang]
 * @return {string}
 */
Format.monthShortName = function(month, lang) {
    if(lang === undefined) lang = L10n.getLanguage();
    let names = {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ru: ['Янв.', 'Фев.', 'Мар.', 'Апр.', 'Май', 'Июн.', 'Июл.', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.'],
    };
    return names[lang][month];
};

/**
 * Formats given date in the given format.
 * @param {string|number} date
 * @param {string} [format]
 */
Format.date = function(date, format){
    if(format === undefined) format = 'd m Y';
    return formatDate(date, format);
};


function formatDate(date, format) {
    if(date === null || date === '') return '';
    if(date.indexOf(' ') < 0) date += ' 01:00:00';
    let dt = new Date(date);

    let Y = dt.getFullYear();
    let m, d;
    if(L10n.getLanguage() === 'ru'){
        m = Format.monthShortName(dt.getMonth()).toLowerCase();
        d = dt.getDate()
    }else{
        m = Format.monthShortName(dt.getMonth());
        d = Format.ordinal(dt.getDate());
    }
    let result = '';
    for(let i = 0; i < format.length; i++){
        if(format[i] === 'Y'){
            result += Y;
        }else if(format[i] === 'm'){
            result += m;
        }else if(format[i] === 'd'){
            result += d;
        }else{
            result += format[i];
        }
    }
    return result;
}


/**
 * Formats given time in given format.
 * @param {string|number} time
 * @param {string} [format]
 * @returns {string}
 */
Format.time = function (time, format) {
    return Format.date(time, format === undefined ? 'H:i' : format);
};


/**
 * Formats given amount as money.
 * @param amount
 * @param currency
 * @returns {*}
 */
Format.money = function (amount, currency) {
    if(amount === null) return '';
    return ((currency === 'EUR' ? '€' : '$') + ' ' + parseFloat(amount)).replace(',', '.');
};
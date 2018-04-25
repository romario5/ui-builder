/**
 *           URL
 * ___________________________
 * ---------------------------
 *
 * Url is a function that creates url depending on the given route.
 * In other words it refines given url by adding/changing some parts of it.
 * The manipulations with url will be done by the functions from 'urlRefiners' object.
 * It can be changed using URL.setRefiner(function(){...});
 */

/**
 * List of the registered refiners.
 * Each refiner accepts one argument - url (string)
 * and returns another url (string) after some manipulations (adding language for example).
 * All refiners will be called one by one passing the result of previous as argument to the next one.
 * @type {{}}
 */
var urlRefiners = {};

/**
 * List of registered parsers.
 * Each parser accepts 2 arguments:
 * - url {string} Urt to be parsed.
 * - params {object} Object in which url parameters can be added.
 * @type {{}}
 */
var urlParsers = {};


/**
 * Generates url using refining function.
 * @param {string} route
 * @param {object} [params]
 * @private
 */
var _url = function(route, params){
	for(var p in urlRefiners){
		route = urlRefiners[p](route, params);
	}
	return route;
};
_uibuilder.Url = _url;


/**
 * Registers refiner with the given name.
 * @param name {string}
 * @param refiner {function}
 */
_url.setRefiner = function(name, refiner){
	if(typeof refiner === 'function'){
		urlRefiners[name] = refiner;
	}
};


/**
 * Registers parser with the given name.
 * @param name {string}
 * @param parser {function}
 */
_url.setParser = function(name, parser){
	if(typeof parser === 'function'){
		urlParsers[name] = parser;
	}
};


/**
 * Parses url into route and parameters.
 * @param {string} url
 * @returns {{route: *, params: *}}
 */
_url.parse = function(url)
{
    var matches = url.match(/\?(&?[\w\d-_%]+=[\w\d-_%]*)+/gi);

    var query = matches !== null && matches.length > 0 ? matches[0] : '';
    url = url.replace(query, '').replace(window.location.origin, '');
    if(query[0] === '?') query = query.slice(1);

    var params = {};
    var queryParameters = query.split('&');
    for(var i = 0; i < queryParameters.length; i++){
        var v = queryParameters[i].split('=');
        if(v.length > 1){
            params[v[0]] = v[1];
        }
    }

    for(var p in urlParsers){
        var res = urlParsers[p](url, params);
        url = res.url;
        params = res.params;
    }
    return {route : url, params : params};
};
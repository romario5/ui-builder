/**
 * List of the registered refiners.
 * Each refiner accepts one argument - url (string)
 * and returns another url (string) after some manipulations (adding language for example).
 * All refiners will be called one by one passing the result of previous as argument to the next one.
 * @type {{}}
 */
let urlRefiners = {};

/**
 * List of registered parsers.
 * Each parser accepts 2 arguments:
 * - url {string} Urt to be parsed.
 * - params {object} Object in which url parameters can be added.
 * @type {{}}
 */
let urlParsers = {};


/**
 * IMPORTANT!!!
 * All methods of the Url will be removed to the Route.
 * Don't use global Url object any more.
 *
 * Url is a function that creates url depending on the given route.
 * In other words it refines given url by adding/changing some parts of it.
 * The manipulations with url will be done by the functions from 'urlRefiners' object.
 * It can be changed using URL.setRefiner(function(){...});
 * @param {string} route
 * @param {object} [params]
 * @return string
 * @private
 * @deprecated
 */
export default function Url(route, params){
    for(let p in urlRefiners){
        route = urlRefiners[p](route, params);
    }
    return route;
};


/**
 * Registers refiner with the given name.
 * @param name {string}
 * @param refiner {function}
 */
Url.setRefiner = function(name, refiner){
    if(typeof refiner === 'function'){
        urlRefiners[name] = refiner;
    }
};


/**
 * Registers parser with the given name.
 * @param name {string}
 * @param parser {function}
 */
Url.setParser = function(name, parser){
    if(typeof parser === 'function'){
        urlParsers[name] = parser;
    }
};


/**
 * Parses url into route and parameters.
 * @param {string} url
 * @returns {{route: *, params: *}}
 */
Url.parse = function(url)
{
    let matches = url.match(/\?(&?[\w\d-_%]+=[\w\d-_%]*)+/gi);

    let query = matches !== null && matches.length > 0 ? matches[0] : '';
    url = url.replace(query, '').replace(window.location.origin, '');
    if(query[0] === '?') query = query.slice(1);

    let params = {};
    let queryParameters = query.split('&');
    for(let i = 0; i < queryParameters.length; i++){
        let v = queryParameters[i].split('=');
        if(v.length > 1){
            params[v[0]] = v[1];
        }
    }

    for(let p in urlParsers){
        let res = urlParsers[p](url, params);
        url = res.url;
        params = res.params;
    }
    return {route : url, params : params};
};


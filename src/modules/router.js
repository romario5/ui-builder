import addEventsMethods from '../utils/events-methods';
import {warn} from '../utils/logging';
import Url from './url';

/**
 * List of the available routes.
 * @type {{}}
 */
let routes = {};

/**
 * Link to the current route.
 * @type {Route|null}
 */
let curRoute = null;

let curRouteParams = null;

/**
 * Link to the previous route.
 * @type {Route|null}
 */
let prevRoute = null;




/**
 * Returns route by name.
 *
 * Also provides few global events:
 *
 * @event apply
 * The handlers accept 2 arguments: 'params' (object) and 'event' (UIEvent)
 * If event is canceled - the applying will be terminated.
 * Occurred just before route will be applied.
 *
 * @event leave
 * The handlers accept 3 arguments:
 * 'oldRoute' (string), 'newRoute' (string) and 'event' (UIEvent)
 * Occurred just after route has been applied.
 *
 * @return {Route|null}
 */
export default function RouteManager(route){
    route = route.replace('\\', '/');
    let r = null;
    if(!routes.hasOwnProperty(route)){
        let arr = route.split('/'),
            placeholders = [],
            cutRoute,
            i, p;

        // Check routes with ? from the start.
        for(i = 1; i <= arr.length - 1; i++){
            placeholders.push('?');
            p = placeholders.join('/');
            cutRoute = arr.slice(i).join('/');
            if(routes.hasOwnProperty(p + '/' + cutRoute)){
                r = routes[p + '/' + cutRoute];
                break;
            }
            if(routes.hasOwnProperty('??/' + cutRoute)){
                r = routes['??/' + cutRoute];
                break;
            }
        }

        placeholders = [];
        // Check routes with ? from the end.
        for(i = arr.length - 1; i >= 1; i--){
            placeholders.push('?');
            p = placeholders.join('/');
            cutRoute = arr.slice(i).join('/');
            if(routes.hasOwnProperty(cutRoute + '/' + p)){
                r = routes[cutRoute + '/' + p];
                break;
            }
            if(routes.hasOwnProperty(cutRoute + '/??')){
                r = routes[cutRoute + '/??'];
                break;
            }
        }

    }else{
        r = routes[route];
    }
    return r;
};

// Add global routing events support.
addEventsMethods(RouteManager);



/**
 * Registers new route.
 * @param route
 * @returns {*}
 */
RouteManager.register = function(route){
    routes[route] = new Route(route);
    return routes[route];
};

/**
 * Simply returns current route.
 * @returns {Route|null}
 */
RouteManager.current = function(){
    return curRoute.clone();
};

/**
 * Simply returns current route.
 * @returns {Route|null}
 */
RouteManager.previous = function(){
    return prevRoute;
};

RouteManager.currentParams = function () {
    return curRouteParams;
};


/**
 * Applies route with given name if exists.
 * Route can contain variable and placeholders.
 *
 * Examples:
 *  ?/company              - Any route that contains two elements where first is any and second is "company".
 *  companies/company/{id} - {id} will be replaced with "id" parameter.
 *  ??/settings            - Any route but ending with "settings".
 *
 * Usage:
 *  Route.apply('?/article/{id}', {
 *       id: 5
 *  });
 *
 * @param url {string}
 * @param params {object}
 * @return {boolean}
 */
RouteManager.apply = function(url, params)
{
    let urlData = Url.parse(url);
    url = urlData.route;
    let newParams = urlData.params;
    for(let p in newParams){
        if (newParams.hasOwnProperty(p)) {
            params[p] = newParams[p];
        }
    }

    // Process Url variables.
    for(let p in params){
        if( url.indexOf('{' + p + '}') >= 0){
            url.replace('{' + p + '}', encodeURIComponent(params[p]));
            delete params[p];
        }
    }

    let route = RouteManager(url);
    if(route !== null){
        route.apply(params);
        return true;
    }
    return false;
};


RouteManager.applyChain = function(url)
{
    if (url.length > 0 && url[0] === '/') {
        url = url.slice(1);
    }
    let urlData = Url.parse(url),
        arr = urlData.route.split('/'),
        params = urlData.params,
        route;

    for(let i = 0; i < arr.length; i++){
        route = RouteManager(arr.slice(0, i+1).join('/'));
        if(route === null){
            warn('Routes chain broken: route "' + arr.slice(0, i).join('/') + '" is absent.');
            return;
        }else{
            route.apply(params);
        }
    }
};


/**
 * Route that provides events for implementing routing logic.
 * @param route
 * @constructor
 */
function Route(route) {
    this.route = route;
    this.params = {};

    this.__ = {
        events: {},
        dispatchers: {}
    };
}

Route.prototype = {
    constructor : Route,

    clone: function () {
        let route = new Route(this.route);
        route.params = this.params;
        route.__ = this.__;
        return route;
    },

    /**
     * Applies route with given parameters.
     * Returns true if 'apply' event was triggered on the route.
     * If 'apply' event was canceled globally - false will be returned.
     * @return {boolean}
     */
    apply : function(params){
        if(params === undefined || params === null){
            params = this.params;
        }
        this.params = params;

        // Trigger 'apply' event.
        let event = new Event('apply', {cancelable: true});

        if(params === undefined) params = {};

        // Trigger globally and if user calls preventDefault()
        // method - stop execution.
        RouteManager.triggerEvent('apply', this.route, params, event);
        if(event.defaultPrevented) return false;

        // Trigger apply event on the route.
        this.triggerEvent('apply', params, event);
        if(event.defaultPrevented) return false;



        let curUrlData = Url.parse(window.location.pathname);
        let curUrlArray = curUrlData.route.split('/');
        if(curUrlArray.length > 1 && curUrlArray[0] === '') curUrlArray.shift();

        let routeArray = this.route.split('/');
        for(let i = 0; i < routeArray.length; i++){
            if(curUrlArray.length > i){
                if(routeArray[i] === '??'){
                    routeArray[i] = curUrlArray.slice(0, i+1).join('/');
                }else if(routeArray[i] === '?'){
                    routeArray[i] = curUrlArray[i];
                }
            }
        }

        history.pushState(params, '', Url('/' + routeArray.join('/'), params).replace('//', ''));

        // Store old route.
        prevRoute = curRoute;

        // Set new current route.
        curRoute = this;
        curRouteParams = params;

        // Trigger globally and if user calls preventDefault()
        // method - stop execution.
        if(prevRoute instanceof Route){
            // Trigger 'leave' event.
            event = new Event('leave', {cancelable: true});

            RouteManager.triggerEvent('leave', prevRoute.route, curRoute.route, event);
            if(event.defaultPrevented) return true;

            prevRoute.triggerEvent('leave', prevRoute.route, curRoute.route, event);
        }
        return true;
    },

    runParentRoute : function(params){
        let arr = this.route.split('/');
        if(arr.length < 2){
            return false;
        }
        arr.pop();
        let parentRoute = arr.join('/');
        let route = RouteManager(parentRoute);

        if(route !== null){
            let event = new Event('apply', {cancelable: true});
            route.triggerEvent('apply', params, event);
            if (!event.defaultPrevented) {
                route.apply();
                return true;
            }
        }
        return false;
    },

    revert: function () {

    }
};

// Add events support for the Route.
addEventsMethods(Route.prototype);

// Create default route.
curRoute = RouteManager.register('/');
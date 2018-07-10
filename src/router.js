/**
 *           Routes
 * ___________________________
 * ---------------------------
 *
 * Routes are the objects that encapsulates application state.
 * This section will be done later.
 */

/**
 * List of the available routes.
 * @type {{}}
 */
var routes = {};

/**
 * Link to the current route.
 * @type {Route|null}
 */
var curRoute = null;

/**
 * Link to the previous route.
 * @type {Route|null}
 */
var prevRoute = null;




/**
 * Exported function.
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
var _router = function(route){
    route = route.replace('\\', '/');
    var r = null;
	if(!routes.hasOwnProperty(route)){
	    var arr = route.split('/'),
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
addEventsImplementation.call(_router);


// Export router.
_uibuilder.Route = _router;


/**
 * Registers new route.
 * @param route
 * @returns {*}
 */
_router.register = function(route){
	routes[route] = new Route(route);
	return routes[route];
};

/**
 * Simply returns current route.
 * @returns {Route|null}
 */
_router.current = function(){
	return curRoute;
};

/**
 * Simply returns current route.
 * @returns {Route|null}
 */
_router.previous = function(){
	return prevRoute;
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
_router.apply = function(url, params)
{
    var urlData = _url.parse(url);
    url = urlData.route;
    var newParams = urlData.params;
    for(var p in newParams){
        params[p] = newParams[p];
    }

    // Process Url variables.
    for(var p in params){
        if( url.indexOf('{' + p + '}') >= 0){
            url.replace('{' + p + '}', encodeURIComponent(params[p]));
            delete params[p];
        }
    }

	var route = _router(url);
	if(route !== null){
		route.apply(params);
		return true;
	}
	return false;
};


_router.applyChain = function(url)
{
    var urlData = _url.parse(url);
    var arr = urlData.route.split('/');
    var params = urlData.params;
    var route;

    for(var i = 0; i < arr.length; i++){
        route = _router(arr.slice(0, i+1).join('/'));
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

	this.__ = {
	    events: {},
        dispatchers: {}
    };
}

Route.prototype = {
	constructor : Route,

	/**
	 * Applies route with given parameters.
	 * Returns true if 'apply' event was triggered on the route.
	 * If 'apply' event was canceled globally - false will be returned.
	 * @return {boolean}
	 */
	apply : function(params){
		// Trigger 'apply' event.
		var event = new Event('apply', {cancelable: true});

		if(params === undefined) params = {};

		// Trigger globally and if user calls preventDefault()
		// method - stop execution.
		_router.triggerEvent('apply', this.route, params, event);
		if(event.defaultPrevented) return false;

		// Trigger apply event on the route.
		this.triggerEvent('apply', params, event);
        if(event.defaultPrevented) return false;



        var curUrlData = _url.parse(window.location.pathname);
        var curUrlArray = curUrlData.route.split('/');
        if(curUrlArray.length > 1 && curUrlArray[0] === '') curUrlArray.shift();

        var routeArray = this.route.split('/');
        for(var i = 0; i < routeArray.length; i++){
            if(curUrlArray.length > i){
                if(routeArray[i] === '??'){
                    routeArray[i] = curUrlArray.slice(0, i+1).join('/');
                }else if(routeArray[i] === '?'){
                    routeArray[i] = curUrlArray[i];
                }
            }
        }

		history.pushState(params, '', _url('/' + routeArray.join('/'), params).replace('//', ''));

		// Store old route.
		prevRoute = curRoute;

		// Set new current route.
		curRoute = this;

		// Trigger globally and if user calls preventDefault()
		// method - stop execution.
		if(prevRoute instanceof Route){
			// Trigger 'leave' event.
			event = new Event('leave', {cancelable: true});

			_router.triggerEvent('leave', prevRoute.route, curRoute.route, event);
			if(event.defaultPrevented) return true;

			prevRoute.triggerEvent('leave', prevRoute.route, curRoute.route, event);
		}
		return true;
	},

	runParentRoute : function(params){
		var arr = this.route.split('/');
		if(arr.length < 2){
			return false;
		}
		arr.pop();
		var parentRoute = arr.join('/');
		var route = _router(parentRoute);

		if(route !== null){
			var event = new Event('apply', {cancelable: true});
			route.triggerEvent('apply', params, event);
		}
		return false;
	},

    revert: function () {

    }
};

// Add events support for the Route.
addEventsImplementation.call(Route.prototype);

// Create default route.
curRoute = _router.register('/');
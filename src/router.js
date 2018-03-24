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
	if(!routes.hasOwnProperty(route)) return null;
	return routes[route];
};

// Define service property that encapsulates hidden data.
Object.defineProperty(_router, '__', {
	value: {},
	configurable: false,
	enumerable: false,
	writeable: false
});
_router.__.events = {};
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
 * @param url {string}
 * @param params {object}
 * @return {boolean}
 */
_router.apply = function(url, params){
	// Parse url
	var res = _url.parse(url, params);
	var route = _router(res.route);
	if(route !== null){
		route.apply(params);
		return true;
	}
	return false;
};


/**
 * Route that provides events for implementing routing logic.
 * @param route
 * @constructor
 */
function Route(route) {
	this.route = route;

	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value: {},
		configurable: false,
		enumerable: false,
		writeable: false
	});

	this.__.events = {};
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
		var event = new UIEvent('apply');

		// Trigger globally and if user calls preventDefault()
		// method - stop execution.
		_router.triggerEvent('apply', params, event);
		if(event.canceled) return false;

		// Trigger apply event on the route.
		this.triggerEvent('apply', params, event);
		history.pushState(params, '', ('/' + this.route).replace('//', ''));

		// Store old route.
		prevRoute = curRoute;

		// Set new current route.
		curRoute = this;

		// Trigger globally and if user calls preventDefault()
		// method - stop execution.
		if(prevRoute instanceof Route){
			// Trigger 'leave' event.
			event = new UIEvent('leave');

			_router.triggerEvent('leave', prevRoute.route, curRoute.route, event);
			if(event.canceled) return true;

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
			var event = new UIEvent('apply');
			route.triggerEvent('apply', params, event);
		}
		return false;
	}
};

// Add events support for the Route.
addEventsImplementation.call(Route.prototype);

// Create default route.
curRoute = _router.register('/');
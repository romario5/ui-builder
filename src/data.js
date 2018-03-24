/**
 *       Data providers
 * ___________________________
 * ---------------------------
 *
 *
 * UIData is a kind of data provider that used to retrieve data
 * from some storages or resources or generate it itself.
 * To get data use fetch() method.
 * Also UIData provides events support.
 *
 * The data fetched by the UIData can be cached.
 * To use cache define "cacheLifetime" property when configuring the UIData.
 * If lifetime is null then cache will not be used.
 * If lifetime is zero (0) then cached data will be returning until the page will be refreshed.
 *
 * If you need to use some data on fetching process (AJAX or generating depending on user input, etc.)
 * the parameters() method can be used for this purposes.
 *
 * The next events are available:
 * - fetch (Occurred when fetch() method is called)
 * - progress (When another part of data is ready)
 * - dataready (When UIData is ready to return data)
 * - error (If error is occurred during data fetching an error event will be triggered)
 *
 * @param {object} params - Parameters that contains necessary data for fetching.
 * @constructor
 */
function UIData(params) {
	// Define service property that encapsulates hidden data.
	Object.defineProperty(this, '__', {
		value: {},
		configurable: false,
		enumerable: false,
		writeable: false
	});

	this.__.events = {};

	this.hasError = false;
	this.ready = true;         // Flag if UIData is ready to fetching.
	this.cache = null;         // Data got by last fetch.
	this.cacheLifetime = null; // Lifetime of cache. null - not used. 0 - until page refresh.
	this.allowMultiple = true;

	// Set the collector.
	if (params.hasOwnProperty('collector')) {
		if (typeof params.collector !== 'function')
			throw new UIDataException('Collector must be a function but ' + typeof params.collector + ' given.');
		this.collector = params.collector;
	} else {
		this.collector = defaultCollector;
	}

	if (params.hasOwnProperty('onfetch') && typeof params.onfetch === 'function') {
		this.on('fetch', params.onfetch);
	}

	this.waitingLimit = params.hasOwnProperty('waitingTime') ? parseInt(params.waitingTime) : 3000;
	this.timeElapsed = 0;

	this.lastFetchTime = Date.now();
	if(params.hasOwnProperty('data')){
		this._parameters = params.data;
	}else{
		this._parameters = params.hasOwnProperty('parameters') ? params.parameters : {};
	}
}

UIData.prototype = {};


/**
 * Sets parameters of the UIData. It can be used during fetching process.
 * For example in UIDataAjax parameters will be send with request.
 * @param parameters
 * @returns {UIData}
 */
UIData.prototype.parameters = function (parameters) {
	if(parameters === undefined){
		return this._parameters;
	}
	this._parameters = parameters;
	return this;
};
UIData.prototype.params = UIData.prototype.parameters;


/**
 * Fetches data by executing collector.
 */
UIData.prototype.fetch = function (callback) {
	this.hasError = false;
	this.triggerEvent('fetch');
	if (typeof params === 'object') this.params = params;
	if ((this.allowMultiple || this.ready) && typeof this.collector === 'function') {
		this.ready = false;
		return this.collector(callback);
	}
	return false;
};


UIData.prototype.send = UIData.prototype.fetch;


// Add events to the UIData's instances.
addEventsImplementation.call(UIData.prototype);

// Also add events to the UIData object globally.
Object.defineProperty(UIData, '__', {
	value: {},
	configurable: false,
	enumerable: false,
	writeable: false
});
UIData.__.events = {};
addEventsImplementation.call(UIData);

_uibuilder.UIData = UIData;



/**
 *      Data collectors
 * ___________________________
 * ---------------------------
 *
 * Data collectors are the functions that encapsulate
 * data fetching process and provide unified procedure of the
 * returning fetched data.
 * Data returning is implemented by using a callback function
 * that will be called just after data received.
 * Also data collectors triggers all necessary events of the
 * UIData to which they was attached.
 *
 * Events that can be triggered:
 * - complete (When data fetching process is complete)
 * - dataready (When data is successfully fetched)
 * - error (If error is occurred)
 * - progress (If a part of all data was fetched. Percentage of the data done must be passed in the second argument.)
 *
 * @param {function} callback
 * @see UIData
 */
function defaultCollector(callback) {
	if (typeof callback !== 'function') this.triggerEvent('error');
	callback(this.cache, this);
	this.triggerEvent('dataready', this.cache);
}



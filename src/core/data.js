import addEventsMethods from '../utils/events-methods';

/**
 * Data provider
 *
 * Data is a kind of data provider that used to retrieve data
 * from some storage or resource or generate it itself.
 * To get data use fetch() method.
 * Also Data provides events support.
 *
 * The data fetched by the Data can be cached.
 * To use cache define "cacheLifetime" property when configuring the Data.
 * If lifetime is null then cache will not be used.
 * If lifetime is Infinity then cached data will be returning until the page will be refreshed.
 *
 * If you need to use some data on fetching process (AJAX or generating depending on user input, etc.)
 * the parameters() method can be used for this purposes.
 *
 * The next events are available:
 * - fetch     fetch() method is called
 * - progress  another part of data is ready
 * - dataReady Data is ready to return data
 * - error     error is occurred during data fetching an error event will be triggered
 *
 * @method on(eventName, args...)
 * @param {object} params - Parameters that contains necessary data for fetching.
 * @constructor
 */
export default class Data
{
    constructor(params){
        if (params === undefined) {
            params = {};
        }

        // Define service property that encapsulates hidden data.
        this.__ = {
            events: {},
            dispatchers: {},
            eventsTimeouts: {}
        };

        /**
         * Flag if last fetch was completed with error.
         * @type {boolean}
         */
        this.hasError = false;

        /**
         * Flag if Data is ready to fetching.
         * @type {boolean}
         */
        this.ready = true;

        /**
         * Data got by last fetch.
         * @type {null|*}
         */
        this.cache = null;

        /**
         * Lifetime of cache. null - not used. Infinity - until page refresh.
         * @type null|number|Infinity
         */
        this.cacheLifetime = null;

        /**
         * If true allows to fetch data if previous
         * fetch process is not completed yet.
         * Set is to false to prevent unnecessary fetching calls.
         * @type {boolean}
         */
        this.allowMultiple = true;

        /**
         * Set the collector.
         * Data collector is a function that provides data by the given parameters.
         * If not set - defaultCollector will be used.
         */
        if (params.hasOwnProperty('collector')) {
            if (typeof params.collector !== 'function')
                throw new UIDataException('Collector must be a function but ' + typeof params.collector + ' given.');
            this.collector = params.collector;
        } else {
            this.collector = defaultCollector;
        }

        // Add events handlers if any given with 'on' prefix.
        let events = ['fetch', 'complete', 'error', 'progress'];
        for(let i = 0; i < events.length; i++){
            if (params.hasOwnProperty('on' + events[i]) && typeof params['on' + events[i]] === 'function') {
                this.on(events[i], params['on' + events[i]]);
            }
        }

        /**
         * Time in which data should be loaded.
         * If waiting time is elapsed - an error event will be triggered
         * and [hasError] property will be set to true.
         * @type {number}
         */
        this.waitingLimit = params.hasOwnProperty('waitingTime') ? parseInt(params['waitingTime']) : 3000;

        /**
         * Last data fetching time.
         * @type {number}
         */
        this.timeElapsed = 0;

        /**
         * UNIX timestamp which indicates last fetching start time.
         * @type {number}
         */
        this.lastFetchTime = Date.now();

        /**
         * Data to be used on fetching.
         * For example it can be parameters to be sent via AJAX.
         */
        if(params.hasOwnProperty('data')){
            this._parameters = params.data;
        }else{
            this._parameters = params.hasOwnProperty('parameters') ? params.parameters : {};
        }
    }

    /**
     * Sets parameters of the Data. It can be used during fetching process.
     * For example in DataAjax parameters will be send with request.
     * @param [params] {object}
     * @returns {Data}
     */
    parameters(params) {
        if(params === undefined){
            return this._parameters;
        }
        this._parameters = params;
        return this;
    }

    /**
     * Alias for the parameters() method.
     * @param [params] {object}
     * @return {Data}
     */
    params(params) {
        return this.parameters(params);
    }

    /**
     * Fetches data by executing collector.
     * @param [callback] {function}
     * @return {boolean|*}
     */
    fetch(callback) {
        this.hasError = false;
        if ((this.allowMultiple || this.ready) && typeof this.collector === 'function') {
            this.triggerEvent('fetch');
            this.ready = false;
            return this.collector(callback);
        }
        if (typeof params === 'object') this.params = params;
        return false;
    }

    /**
     * Alias for the fetch() method.
     * @param [callback] {function}
     * @return {boolean|*}
     */
    send(callback) {
        return this.fetch(callback);
    }
}

// Add events to the Data's instances.
addEventsMethods(Data.prototype);

// Also add events to the Data object globally.
addEventsMethods(Data);


/**
 * Data collector
 *
 * Data collectors are the functions that encapsulate
 * data fetching process and provide unified procedure of the
 * returning fetched data.
 * Data returning is implemented by using a callback function
 * that will be called just after data received.
 * Also data collectors triggers all necessary events of the
 * Data to which they was attached.
 *
 * Events that can be triggered:
 * - complete  When data fetching process is complete
 * - dataReady When data is successfully fetched
 * - error     If error is occurred
 * - progress  If a part of all data was fetched. Percentage of the data done must be passed in the second argument.
 *
 * @param {function} callback
 * @see Data
 */
function defaultCollector(callback) {
    if (typeof callback !== 'function') this.triggerEvent('error');
    callback(this.cache, this);
    this.triggerEvent('dataReady', this.cache);
}



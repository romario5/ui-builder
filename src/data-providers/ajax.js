import Data from '../core/data';
import addEventsMethods from '../utils/events-methods';
import {warn, error} from '../utils/logging';
import {csrfParam, csrfToken} from '../modules/CSRF';

export default class Ajax extends Data
{
    constructor(params) {
        super(params);
        this.useCsrf = params.hasOwnProperty('useCsrf') ? params.useCsrf : true;
        this.url = params.hasOwnProperty('url') ? params.url : '';
        this.method = params.method || 'POST';
        this.collector = ajaxCollector;
        this.headers = params.headers || {'X-Requested-With': 'XMLHttpRequest'};
        this.hasError = false;
    }

    triggerErrorEvents(statusCode) {
        this.hasError = true;
        let event = new Event('error', {cancelable: true});
        this.triggerEvent('error', statusCode, event);
        Ajax.triggerEvent('error', this, statusCode, event);
        return event;
    }


    triggerRedirectionEvents(statusCode, newUrl) {
        let event = new Event('redirect', {cancelable: true});
        this.triggerEvent('redirect', statusCode, newUrl, event);
        Ajax.triggerEvent('redirect', this, statusCode, newUrl, event);
        return event;
    }
}

// Add events to the Ajax object globally.
addEventsMethods(Ajax);


/**
 * Object that stores permanent redirections (301 and 308 status codes).
 * @type {{}}
 */
let permanentRedirections = {};


/**
 * Data collector that used in the Ajax.
 * The AJAX request will be used to fetch data.
 * UIData object to which this collector is attached must have
 * next properties:
 * - url (URL address of the resources)
 * - method (POST or GET)
 *
 * @param {function} callback
 * @see UIDataAjax
 */
function ajaxCollector(callback) {
    if (typeof this.url !== 'string') {
        this.triggerEvent('error');
        error('URL for the ajaxCollector is not a string (' + typeof this.url + ' given).');
        return false;
    }

    // If requested resource was permanently moved - use redirection url instead.
    let url = permanentRedirections.hasOwnProperty(this.url) ? permanentRedirections[this.url] : this.url;

    // Store link for the Data object for using via closure.
    let _uidata = this;

    // Create request object.
    let xhttp = new XMLHttpRequest();


    // Track progress.
    xhttp.onprogress = e => {
        if (e.lengthComputable) {
            this.triggerEvent('progress', Math.ceil(e.loaded / e.total * 100));
        }
    };

    // Handle status.
    xhttp.onreadystatechange = function (e) {
        if (this.readyState !== 4) return;


        if([302, 303, 307].indexOf(this.status) >= 0) {
            let newUrl = this.getResponseHeader('Location');

            /**
             * Handle permanent redirections.
             * @see [https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections#Permanent_redirections]
             */
            if (this.status === 301 || this.status === 308) {
                // If invalid "Location" header given - fire error event.
                if (newUrl === '' || newUrl === null) {
                    error('Invalid redirection url for "' + _uidata.url + '" (empty "Location" header).');
                    _uidata.triggerErrorEvents(this.status);
                }
            }


            // Store redirection rule for the initial URL to make redirection automatically in the future.
            permanentRedirections[_uidata.url] = newUrl;
            let event = _uidata.triggerRedirectionEvents(this.status, newUrl);
            if (event.defaultPrevented) {
                e.preventDefault();
            }


        // Process success status.
        }else if (this.status === 200) {

            /** Make redirection if X-Redirect header is specified.
             *
             */
            try{
                let redirectionUrl = this.getResponseHeader('X-Redirect');

                if (redirectionUrl !== null) {
                    let event = _uidata.triggerRedirectionEvents(this.status, redirectionUrl);
                    if (!event.defaultPrevented) {
                        window.location.replace(redirectionUrl);
                    }
                }
            }catch(e){
                // warn('X-Redirect header is not allowed here.');
            }


            // Get data depending on content-type header.
            let data;
            let contentType = this.getResponseHeader("content-type");
            if (typeof contentType === 'string' && contentType.indexOf('json') >= 0) {
                data = JSON.parse(this.responseText);
            } else {
                data = this.responseText;
            }
            _uidata.cache = _uidata.cacheLifetime === null || _uidata.cacheLifetime > 0 ? data : null;
            _uidata.triggerEvent('dataReady', data);

            _uidata.triggerEvent('complete', data);
            DataAjax.triggerEvent('complete', _uidata);

            _uidata.triggerEvent('progress', 100);
            if (typeof callback === 'function') callback(data, _uidata);

        // Otherwise trigger error events.
        } else {
            _uidata.hasError = true;
            let event = new Event('error', {cancelable: true});
            _uidata.triggerEvent('error', this.status, event);
            Ajax.triggerEvent('error', _uidata, this.status, event);

            event = new Event('complete', {cancelable: true});

            _uidata.triggerEvent('complete', this.status, event);
            Ajax.triggerEvent('complete', _uidata, this.status, event);
        }

        _uidata.lastFetchTime = Date.now();
        _uidata.ready = true;
    };

    let data = [];
    if( !(this._prameters instanceof FormData) ) {
        for (let p in this._parameters) {
            if (typeof this._parameters[p] === 'object') {
                data.push(encodeURIComponent(p) + '=' + encodeURIComponent(JSON.stringify(this._parameters[p])));
            } else {
                data.push(encodeURIComponent(p) + '=' + encodeURIComponent(this._parameters[p]));
            }
        }
    }

    xhttp.open(this.method, url + (this.method === 'GET' && data.length > 0 ? (url.indexOf('?') < 0 ? '?' : '&')+data.join('&') : ''), true);

    Ajax.triggerEvent('send', _uidata);
    _uidata.triggerEvent('send');

    // Set headers.
    for(let h in _uidata.headers){
        xhttp.setRequestHeader(h, _uidata.headers[h]);
    }

    // Add CSRF token to the header if it's set and method is POST.
    if(_uidata.useCsrf && csrfToken !== null){
        xhttp.setRequestHeader(csrfParam, csrfToken);
    }

    if (this.method.toUpperCase() === 'POST') {
        if(this._parameters instanceof FormData){
            // Add CSRF token to the request if it's set and method is POST.
            if(_uidata.useCsrf && csrfToken !== null){
                this._parameters.append(csrfParam, csrfToken);
            }
            xhttp.send(this._parameters);
            return true;
        }

        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        // Add CSRF token.
        if(_uidata.useCsrf && csrfToken !== null){
            data.push(csrfParam + '=' + csrfToken);
        }
        xhttp.send(data.join('&'));
    } else {
        xhttp.send();
    }

    return true;
}


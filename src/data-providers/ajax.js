 /**
 * Events are already implemented for UIData, so it's not necessary to add it here again.
 */
function UIDataAjax(params)
{
	UIData.call(this, params);
	this.useCsrf = params.hasOwnProperty('useCsrf') ? params.useCsrf : true;
	this.url = params.hasOwnProperty('url') ? params.url : '';
	this.method = params.method || 'POST';
	this.collector = ajaxCollector;
    this.headers = params.headers || {
        'X-Requested-With': 'XMLHttpRequest',
    };
}

UIDataAjax.prototype = Object.create(UIData.prototype);
UIDataAjax.prototype.constructor = UIData;


// Add events to the UIDataAjax object globally.
addEventsImplementation.call(UIDataAjax);
_uibuilder.UIDataAjax = UIDataAjax;


/**
 * Data collector that used in the UIDataAjax.
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
	if (typeof callback !== 'function') {
		this.triggerEvent('error');
		warn('Callback for the ajaxCollector is not a function (' + typeof callback + ' given).');
	}

	if (typeof this.url !== 'string') {
		this.triggerEvent('error');
		error('URL for the ajaxCollector is not a string (' + typeof this.url + ' given).');
		return false;
	}

	var _uidata = this;

	var xhttp = new XMLHttpRequest();

	var _this = this;
	xhttp.onprogress = function (e) {
		if (e.lengthComputable) {
			_uidata.triggerEvent('progress', Math.ceil(e.loaded / e.total * 100));
		}
	};

	xhttp.onreadystatechange = function () {
		if (this.readyState !== 4) return;

		if (this.status === 200) {

			// Make redirection if X-Redirect header is specified.
			try{
                var url = this.getResponseHeader('X-Redirect');
                if (url !== null) {
                    window.location.replace(url);
                }
			}catch(e){
                console.warn('X-Redirect header is not allowed here.');
            }


			// Get data depending on content-type header.
			var data;
			var contentType = this.getResponseHeader("content-type");
			if (typeof contentType === 'string' && contentType.indexOf('json') >= 0) {
				data = JSON.parse(this.responseText);
			} else {
				data = this.responseText;
			}
			_uidata.cache = _uidata.cacheLifetime === null || _uidata.cacheLifetime > 0 ? data : null;
			_uidata.triggerEvent('dataready', data);
			_uidata.triggerEvent('complete', data);
			DataAjax.triggerEvent('complete', _uidata);
			_uidata.triggerEvent('progress', 100);
			if (typeof callback === 'function') callback(data, _uidata);

		} else {
			_uidata.hasError = true;
			var event = new Event('error', {cancelable: true});
			_uidata.triggerEvent('error', this.status, event);
			DataAjax.triggerEvent('error', _uidata, this.status, event);
            event = new Event('complete', {cancelable: true});
			_uidata.triggerEvent('complete', this.status, event);
			DataAjax.triggerEvent('complete', _uidata, this.status, event);
		}
		_uidata.lastFetchTime = Date.now();
		_uidata.ready = true;
	};

    var data = [];
    for (var p in this._parameters) {
    	if(typeof this._parameters[p] === 'object'){
            data.push(encodeURIComponent(p) + '=' + encodeURIComponent(JSON.stringify(this._parameters[p])));
		}else{
            data.push(encodeURIComponent(p) + '=' + encodeURIComponent(this._parameters[p]));
		}

    }

	xhttp.open(this.method, this.url + (this.method === 'GET' && data.length > 0 ? '?'+data.join('&') : ''), true);

    // Set headers.
    for(var h in _uidata.headers){
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
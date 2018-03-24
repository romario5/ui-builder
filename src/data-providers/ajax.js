 /**
 * Events are already implemented for UIData, so it's not necessary to add it here again.
 */
function UIDataAjax(params)
{
	UIData.call(this, params);
	this.useCsrf = params.hasOwnProperty('useCsrf') ? params.useCsrf : true;
	this.url = params.hasOwnProperty('url') ? params.url : '';
	this.method = 'POST';
	this.collector = ajaxCollector;
}

UIDataAjax.prototype = Object.create(UIData.prototype);
UIDataAjax.prototype.constructor = UIData;


// Add events to the UIDataAjax object globally.
addEventsImplementation.call(UIDataAjax);
Object.defineProperty(UIDataAjax, '__', {
	value: {},
	configurable: false,
	enumerable: false,
	writeable: false
});
UIDataAjax.__.events = {};
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
			var url = this.getResponseHeader('X-Redirect');
			if (url !== null) {
				window.location.replace(url);
			} else {
				_uidata.triggerEvent('error', this.status);
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
			_uidata.triggerEvent('error', this.status);
			DataAjax.triggerEvent('error', _uidata);
			_uidata.triggerEvent('complete', this.status);
			DataAjax.triggerEvent('complete', _uidata);
		}
		_uidata.lastFetchTime = Date.now();
		_uidata.ready = true;
	};

	xhttp.open(this.method, this.url, true);

	// Set header that indicates that request was made by AJAX.
	xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

	// Add CSRF token to the header if it's set and method is POST.
	if(_uidata.useCsrf && csrfToken !== null){
		xhttp.setRequestHeader(csrfParam, csrfToken);
	}


	if (this.method.toUpperCase() === 'POST')
	{
		if(this._parameters instanceof FormData){
			// Add CSRF token to the request if it's set and method is POST.
			if(_uidata.useCsrf && csrfToken !== null){
				this._parameters.append(csrfParam, csrfToken);
			}
			xhttp.send(this._parameters);
			return true;
		}

		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		var data = [];
		for (var p in this._parameters) {
			data.push(encodeURIComponent(p) + '=' + encodeURIComponent(this._parameters[p]));
		}
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
/**
 * WebSocket data provider.
 * Established connection and provides methods and events
 * to work with it.
 * Uses UIWebSocketCollector as data collector.
 * @param params
 * @constructor
 */
function UIDataWS(params)
{
	UIData.call(this, params);
	this.ws = params.ws;
	this.collector = UIWebSocketCollector;
}
UIDataWS.prototype = Object.create(UIData.prototype);
UIDataWS.prototype.constructor = UIData;

// Add events to the UIDataAjax object globally.
addEventsImplementation.call(UIDataWS);

_uibuilder.UIDataWS = UIDataWS;


/**
 * Create custom data collector for the UIDataWS.
 @param {function} callback
 */
function UIWebSocketCollector(callback)
{
	var _this = this;
	this.ws.send(this._parameters, function(data){
		callback.call(_this, data);
		_this.triggerEvent('dataready', _this, data);
	});
}



/**
 * Represents WebSocket connection.
 * @params {object} params
 */
function UIWebSocket(params)
{
	if(!window.WebSocket){
		console.warn('WebSocket is not supported by this browser.');
	}

	var formats = [UIWebSocket.FORMAT_JSON, UIWebSocket.FORMAT_TOKENIZED_JSON, UIWebSocket.FORMAT_RAW];

	this.format = params.hasOwnProperty('format') && formats.indexOf(params.format) >= 0 ? params.format : UIWebSocket.FORMAT_TOKENIZED_JSON;
	this.url = params.url;
	this.authRequestMessage = params.authRequestMessage ? params.authRequestMessage : null;
	this.authSuccessMessage = params.authSuccessMessage ? params.authSuccessMessage : 'authorized';
	this.authFailMessage = params.authFailMessage ? params.authFailMessage : 'authorization failed';
	this.conn = null;
	this.authorized = false;
	this.reconnectionInterval = params.reconnectionInterval ? params.reconnectionInterval : 5000;
	this.tokens = {};
	this.__ = {
		events : {},
		dispatchers: {}
	}
}

UIWebSocket.FORMAT_JSON = 'json';
UIWebSocket.FORMAT_TOKENIZED_JSON = 'tokenized-json';
UIWebSocket.FORMAT_RAW = 'text';


UIWebSocket.prototype = {};
addEventsImplementation.call(UIWebSocket.prototype);
_uibuilder.WS = UIWebSocket;


/**
 * Events:
 * - onconnect
 * - ondisconnect
 * - onauthstart
 * - onauthsuccess
 * - onauthfail
 * - onmessage
 * - onresponse
 * - onsend
 */
UIWebSocket.prototype.connect = function()
{
	if(this.conn !== null) return;
	var conn = new WebSocket(this.url);
	this.conn = conn;

	var _this = this;
	var ti;

	// Handle connection establishing.
	conn.onopen = function(){
		if(_this.authRequestMessage !== null){
			_this.conn.send(_this.authRequestMessage);
		}
		clearInterval(ti);
		_this.triggerEvent('connect');
	};

	// Handle losing connection and try to reconnect.
	conn.onclose = function() {
		_this.authorized = false;
		_this.conn = null;
		_this.tokens = {};
		ti = setTimeout(function(){
			_this.connect();
		}, _this.reconnectionInterval);
		_this.triggerEvent('disconnect');
	};

	// Handle incoming messages.
	conn.onmessage = function (e) {
		// Handle authorization if it's enabled.
		if(_this.authRequestMessage !== null) {
			if (e.data === _this.authSuccessMessage) {
				_this.authorized = true;
				_this.triggerEvent('authsuccess');
				return;
			} else if (e.data === _this.authFailMessage) {
				_this.authorized = false;
				_this.triggerEvent('authfail');
				return;
			}
		}

		// Trigger onmessage event if there is a raw message format is using.
		if(_this.format === UIWebSocket.FORMAT_RAW){
			_this.triggerEvent('message', e.data);


		}else if(_this.format === UIWebSocket.FORMAT_JSON){
			_this.triggerEvent('message', JSON.parse(e.data));

		}else if(_this.format === UIWebSocket.FORMAT_TOKENIZED_JSON) {
			var data = JSON.parse(e.data);
			if(!data.hasOwnProperty('Token')){
				_this.triggerEvent('message', data);
				return;
			}

			var token = data.Token;
			delete data.Token;

			// Ignore unregistered tokens.
			if(!_this.tokens.hasOwnProperty(token)){
				return;
			}

			if(data.hasOwnProperty('Data')){
				data = data.Data;
			}

			_this.triggerEvent('message', data);
			_this.triggerEvent('response', data);
			_this.tokens[token](data);
			delete _this.tokens[token];
		}
	};
};



UIWebSocket.prototype.send = function(data, callback) {
	if(this.conn === null) return;
	var d = new WebSocketData(data);
	this.tokens[d.token] = callback;
	var dataWrapper = {data: d};
	// Allow user to modify data sent.
	this.triggerEvent('beforeSend', dataWrapper);
	this.conn.send(JSON.stringify(dataWrapper.data));
	this.triggerEvent('send', dataWrapper.data);
};



function randomId(length)
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < length; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}



function WebSocketData(data)
{
	this.token = randomId(12) + Date.now();
	for(var p in data){
		if(!data.hasOwnProperty(p)) continue;
		this[p] = data[p];
	}
}
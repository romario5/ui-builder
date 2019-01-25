import addEventsMethods from '../utils/events-methods';
import Data from '../core/data';
import {warn} from '../utils/logging';


/**
 * WebSocket data provider.
 * Established connection and provides methods and events
 * to work with it.
 * Uses UIWebSocketCollector as data collector.
 * @param params
 * @constructor
 */
export class WSData extends Data
{
    constructor(params) {
        super(params);
        this.ws = params.ws;
        this.collector = UIWebSocketCollector;
    }
}

// Add events to the WSData object globally.
addEventsMethods(WSData);



/**
 * Create custom data collector for the WSData.
 @param {function} callback
 */
function UIWebSocketCollector(callback)
{
    this.ws.send(this._parameters, data => {
        callback.call(this, data);
        this.triggerEvent('dataReady', this, data);
    });
}



/**
 * Represents WebSocket connection.
 * @params {object} params
 */
export function WS(params)
{
    if(!window.WebSocket){
        warn('WebSocket is not supported by this browser.');
    }

    let formats = [WS.FORMAT_JSON, WS.FORMAT_TOKENIZED_JSON, WS.FORMAT_RAW];

    this.format = params.hasOwnProperty('format') && formats.indexOf(params.format) >= 0 ? params.format : WS.FORMAT_TOKENIZED_JSON;
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

WS.FORMAT_JSON = 'json';
WS.FORMAT_TOKENIZED_JSON = 'tokenized-json';
WS.FORMAT_RAW = 'text';


WS.prototype = {};
addEventsMethods(WS.prototype);


/**
 * Events:
 * - connect
 * - disconnect
 * - authStart
 * - authSuccess
 * - authFail
 * - message
 * - response
 * - send
 */
WS.prototype.connect = function()
{
    if(this.conn !== null) return;
    let conn = new WebSocket(this.url);
    this.conn = conn;

    let _this = this;
    let ti;

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
                _this.triggerEvent('authSuccess');
                return;
            } else if (e.data === _this.authFailMessage) {
                _this.authorized = false;
                _this.triggerEvent('authFail');
                return;
            }
        }

        // Trigger onmessage event if there is a raw message format is using.
        if(_this.format === WS.FORMAT_RAW){
            _this.triggerEvent('message', e.data);


        }else if(_this.format === WS.FORMAT_JSON){
            _this.triggerEvent('message', JSON.parse(e.data));

        }else if(_this.format === WS.FORMAT_TOKENIZED_JSON) {
            let data = JSON.parse(e.data);
            if(!data.hasOwnProperty('Token')){
                _this.triggerEvent('message', data);
                return;
            }

            let token = data.Token;
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



WS.prototype.send = function(data, callback) {
    if(this.conn === null) return;
    let d = new Message(data);
    this.tokens[d.token] = callback;
    let dataWrapper = {data: d};
    // Allow user to modify data sent.
    this.triggerEvent('beforeSend', dataWrapper);
    this.conn.send(JSON.stringify(dataWrapper.data));
    this.triggerEvent('send', dataWrapper.data);
};



function randomId(length)
{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i=0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}



export function Message(data)
{
    this.token = randomId(12) + Date.now();
    for(let p in data){
        if(!data.hasOwnProperty(p)) continue;
        this[p] = data[p];
    }
}
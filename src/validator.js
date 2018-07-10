var checkers = {

    /**
     * Checks "required" rule.
     * @param {string} propName
     * @param {object} data
     * @returns {boolean}
     */
    required : function (propName, data) {
        if( !data.hasOwnProperty(propName)
            || data[propName] === ''
            || data[propName] === null
            || data[propName] === undefined ){
            return false;
        }
        return true;
    },


    int : function (propName, data) {
        var intRegexp = /\d+(\.?\d+)?/i;
        if( data.hasOwnProperty(propName) && (typeof data[propName] !== 'number' || !intRegexp.test(data[propName])) ){
            return false;
        }
        return true;
    },


    number : function (propName, data) {
        var intRegexp = /\d+(\.?\d+)?/i;
        if( data.hasOwnProperty(propName) && (typeof data[propName] !== 'number' || !intRegexp.test(data[propName])) ){
            return false;
        }
        return true;
    },


    email : function (propName, data) {
        var emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return emailRegexp.test(data[propName]);
    }
};

function Validator (config) {
    this.rules = {};
    this.labels = {};
    this.errors = {};
}



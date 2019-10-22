/**
 * Class URL represents single url.
 * Creates objects with next structure:
 * {
 *     url: '/some/path?name=someName',
 *     path: '/some/path',
 *     params: {name: 'someName'}
 * ]
 * @param url
 * @constructor
 */
export default function URL (url) {
    if (typeof url === 'string') {
        this.url = url;
        this.params = {};

        let arr = url.split('?');
        this.path = arr[0];

        if (arr.length > 1) {
            let paramsArr = arr[1].split('&');
            for (let i = 0; i < paramsArr.length; i++) {
                let pArr = paramsArr[i].split('=');
                this.params[pArr[0]] = pArr.length > 1 ? decodeURIComponent(pArr[1]) : '';
            }
        }

    } else if (url instanceof URL) {
        this.url = url.url;
        this.path = url.path;
        this.params = {};
        for (let p in url.params) {
            if (url.params.hasOwnProperty(p)) {
                this.params[p] = url.params[p];
            }
        }
    }
}

URL.prototype.gatherParams = function (element) {
    let el = $(element);
    if (el.length === 0) return this;

    let url = this;

    // Handle inputs.
    el.find('input').each(function() {
        let name = $(this).attr('name');
        if (typeof name === 'string' && name.length > 0) {
            url.params[name] = this.value;
        }
    });

    // Handle selects.
    el.find('select').each(function() {
        let name = $(this).attr('name');
        if (typeof name === 'string' && name.length > 0) {
            url.params[name] = this.value;
        }
    });

    // Handle textareas.
    el.find('textarea').each(function() {
        let name = $(this).attr('name');
        if (typeof name === 'string' && name.length > 0) {
            url.params[name] = this.value;
        }
    });

    return this;
};

/**
 * Composes URL to the url string.
 */
URL.prototype.toString = function () {
    let queryArr = [];
    for (let p in this.params) {
        if (this.params.hasOwnProperty(p)) {
            queryArr.push(encodeURIComponent(p) + '=' + encodeURIComponent(this.params[p]));
        }
    }
    return this.path + (queryArr.length === 0 ? '' : '?' + queryArr.join('&'));
};


URL.prototype.removeParams = function (params) {
    for (let i = 0; i < arguments.length; i++) {
        delete this.params[arguments[i]];
    }
};
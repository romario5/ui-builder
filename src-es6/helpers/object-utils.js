/**
 * Returns true if object is empty.
 * @param {object} obj
 * @returns {boolean}
 */
export function isEmpty(obj) {
    if (obj === null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    if (typeof obj !== "object") return true;
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}


/**
 * Creates copy of the given object.
 * Not that only simple objects will be copied recursively.
 * Other objects will be copied as links.
 * @param {object} obj
 * @returns {{}}
 */
export function cloneObject(obj) {
    let clone = {};
    for(let i in obj) {
        if(obj.hasOwnProperty(i)){
            if(Array.isArray(obj[i])){
                clone[i] = obj[i].slice(0);
            }else if(typeof obj[i] === "object" && obj[i].constructor === Object && obj[i] !== null) {
                clone[i] = cloneObject(obj[i]);
            }else{
                clone[i] = obj[i];
            }
        }
    }
    return clone;
}


/**
 * Extends object using another one.
 * Note that properties that are not simple objects will be copied as links without recursion.
 * It used when copying CSS styles: StyleGetter must be copied as link.
 * @param {object} src
 * @param {object} dst
 * @returns {*}
 */
export function extendObject(src, dst) {
    for(let p in src){
        if(src.hasOwnProperty(p)){
            if(typeof src[p] !== 'object' || src[p].constructor !== Object){
                dst[p] = src[p];
            }else{
                if(typeof dst[p] !== 'object'){
                    dst[p] = {};
                }
                extendObject(src[p], dst[p]);
            }
        }
    }
    return dst;
}
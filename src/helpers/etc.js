var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
    if (obj === null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    if (typeof obj !== "object") return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}


function cloneObject(obj) {
    var clone = {};
    for(var i in obj) {
        if(obj.hasOwnProperty(i)){
            if(Array.isArray(obj[i])){
                clone[i] = obj[i].slice(0);
            }else if(typeof obj[i] === "object" && !(obj[i] instanceof StyleGetter) && obj[i] !== null) {
                clone[i] = cloneObject(obj[i]);
            }else{
                clone[i] = obj[i];
            }
        }
    }
    return clone;
}



function extendObject(src, dst) {
    for(var p in src){
        if(src.hasOwnProperty(p)){
            if(typeof src[p] !== 'object' || src[p] instanceof StyleGetter){
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
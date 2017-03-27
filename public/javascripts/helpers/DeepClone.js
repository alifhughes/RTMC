/**
 * Utility function for deep object copying
 *
 * @param   {object} obj  Object to be copied
 * @returns {object}      The deep-copied object
 */
function deepClone (o) {
    var _out, v, _key;
    _out = Array.isArray(o) ? [] : {};
    for (_key in o) {
        v = o[_key];
        _out[_key] = (typeof v === "object") ? deepClone(v) : v;
    }
    return _out;
};

module.exports = deepClone;

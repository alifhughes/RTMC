/**
 * Utility function for deep object cloning
 *
 * @param   {object} object  Object to be cloned
 * @returns {object}      The deep-cloned object
 */
function deepClone (obj) {
    return JSON.parse(JSON.stringify(obj));
};

module.exports = deepClone;

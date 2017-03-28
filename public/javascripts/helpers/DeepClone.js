/**
 * Utility function for deep object cloning
 *
 * @param   {object} obj  Object to be cloned
 * @returns {object}      The deep-cloned object
 */
function deepClone (object) {
    return JSON.parse(JSON.stringify(object));
};

module.exports = deepClone;

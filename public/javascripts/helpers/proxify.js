/**
 * Create proxy object for as an observer
 *
 * @param {object}   object The object to be observered
 * @param {function} change The handler for the change
 * @param {bool}     deep   A flag setter to say if all children of the object should be proxied as well
 * @returns {Proxy}  proxy  The proxy object observing the object passed in
 */
function proxify(object, change, deepProxy) {
    var proxy = new Proxy(object, {
        set: function(object, name, value) {
            var old = object[name];
            if (value && typeof value == 'object') {
                // new object need to be proxify as well
                value = proxify(value, change);
            }
            object[name] = value;
            change(object, name, old, value);
        }
    });
    for (var prop in object) {
        if (object.hasOwnProperty(prop) && object[prop] &&
            typeof object[prop] == 'object') {
                // proxify all child objects
                object[prop] = proxify(object[prop], change);
        }
    }
    return proxy;
}

module.exports = proxify;

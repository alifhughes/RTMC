var $ = require('jquery');

/**
 * Constructor
 *
 * @param   {socket.io socket} socket The socket that the client is connected through
 * @returns {sync}                    Instance of self
 */
var sync = function (socket) {

    // Set the socket
    this.socket = socket;

    // Create an array to hold the changes from the client
    this.clientChanges = [];

    /**
     * Send the client changes
     */
    this.sendChanges = function () {
       socket.emit('edit', {
           clientEdit: this.clientChanges
        });
    };

    socket.on('sync', function(data) {
        // If broadcasted data
        //
        // Could get the data from the server via the client
        // call whatever is going to append the new data to the client
        console.log(data);

        $('#instrumentTracks').append(data.desc);


    });

    return this;
};

/**
 * Add a change to be sync'd
 * @param {string} html The html to be added as a change
 */
sync.prototype.addChange = function () {

    // Append the html to the client changes
    this.clientChanges.push(html);

    /*
     * Check if changes are diff from from servers copy
     * Check if its already not syncing
     * otherwise sync
     */
    // Sync the changes
    this.sendChanges();


    // Implement fluent interface
    return this;
};

/*

// Watch for broadcasted data

*/

module.exports = sync;

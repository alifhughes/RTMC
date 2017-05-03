var _ = require('underscore')._;
var Arrangement = require('../models/arrangement');
var jsondiffpatch = require('jsondiffpatch');

/**
 * Constructor
 */
var Synchronise = function(socketIO) {

    // Object containing all handled client documents
    var allDocuments = {};

    // Object containing all the people
    var people = {};

    // Object containg all the projects
    var projects = {};

    // Array containing all clients
    var clients = [];

    // Set up object comparison
    jsondiffpatch = jsondiffpatch.create({
        objectHash: function(obj) {
            return obj.id || JSON.stringify(obj);
        }
    });

    /**
     * Register a socket on a document
     *
     * @param {GUID}     id       The document id
     * @param {socket}   socket   The socket that the client connected on
     * @param {function} callback
     */
    var registerSocketFor = function(id, socket, callback){
        // Get the document the socket requested to work on
        getDoc(id, function(doc) {
            // Push this socket onto registered sockets
            doc.registeredSockets.push(socket);

            // Get user count and update clients with it
            var noOfUsers = doc.registeredSockets.length;
            socket.broadcast.emit('update-user-count', {userCount: noOfUsers});

            // Callback
            callback();

          });
    };

    /**
     * Send the current server version to the client
     */
    var sendCurrentServerVersion = function(id, socketId, send){

        // Get the document to work on
        getDoc(id, function(doc){

            // Get the servers copy of the arrangment
            var baseDoc = doc.serverCopy;

            // Add the clients version to the doc
            doc.clientVersions[socketId] = {
                backup: {
                    doc: deepCopy(baseDoc),
                    serverVersion: 0
                },
                shadow: {
                    doc: deepCopy(baseDoc),
                    serverVersion: 0,
                    localVersion: 0
                },
                edits: []
            };

            // Get the no of users on the doc
            var noOfUsers = doc.registeredSockets.length;

            // Send the base doc with version number
            send({
                doc: baseDoc,
                userCount: noOfUsers,
                version: 0
            });

        });
    };

    /**
     * Returns the document by ID from the list of documents that server holds
     *
     * @param {GUID}     id        The ID of the document
     * @param {function} callback  The callback function
     * @returns {object} doc       The document
     */
    var getDoc = function(id, callback) {

        // Check if document is in held in servers local memory
        if (allDocuments[id]) {
            // Is in memory, return pass it to the callback
            callback(allDocuments[id]);
        } else {
            // No doc loaded, get it from database
            Arrangement.findById(id, function (error, doc) {

                // Check if error and log it
                if (error) {
                    console.log('Error getting arrangement from database: ' + error);
                }

                // Init document
                allDocuments[id] = {
                    registeredSockets: [],
                    clientVersions: {},
                    serverCopy: doc
                };

                callback(allDocuments[id]);
            });
        }
    };

    /**
     * Function that returns a copy not by reference
     *
     * @param {object} obj  The object to be copied
     * @returns {object}    The copied object
     */
    var deepCopy = function(obj){
        return JSON.parse(JSON.stringify(obj))
    };

    /**
     * Handles receiving the edited document by checking the diffs between the server
     * copies, patching them and broadcasting them out to the other sockets
     *
     * @param {object} clientEdit  The edit object from the client
     * @param {socket} socket      The clients socket
     * @param {function} send      The callback function
     */
    var receiveEdit = function(clientEdit, socket, send) {

        //Get the right document to sync
        // - as there can be many different clients working on different arrangments
        getDoc(clientEdit.id, function(doc) {

            // Get the client version of the document
            var clientDoc = doc.clientVersions[socket.id];

            // If there isnt one, send error
            if(!clientDoc){
                console.log('Need to re-authenticate');
                //socket.emit('error', 'Need to re-authenticate.');
                return;
            }

            // When the versions match, remove old edits stack
            if(clientEdit.serverVersion == clientDoc.shadow.serverVersion){
                clientDoc.edits = [];
            }

            // Iterate over all edits
            clientEdit.edits.forEach(function (edit) {

                // Check the version numbers
                if (edit.serverVersion == clientDoc.shadow.serverVersion &&
                  edit.localVersion == clientDoc.shadow.localVersion) {
                    // Versions match

                    // Create client dock back up
                    clientDoc.backup = deepCopy(clientDoc.shadow);

                    // Patch the shadow
                    var snapshot = deepCopy(clientDoc.shadow.doc);
                    jsondiffpatch.patch(snapshot, edit.diff);
                    clientDoc.shadow.doc = snapshot;

                    // Apply the patch to the server's document
                    snapshot = deepCopy(doc.serverCopy);
                    jsondiffpatch.patch(snapshot, edit.diff);
                    doc.serverCopy = snapshot;

                    // Increase the version number for the shadow if diff not empty
                    if (!_.isEmpty(edit.diff)) {

                        clientDoc.shadow.localVersion++;

                        // notify all sockets about the update, all but this one
                        doc.registeredSockets.forEach(function(soc){
                            if(soc.id != socket.id){
                                soc.emit('updated-document');
                            }
                        });

                    }

                    // Back up to db
                    saveSnapshot(clientEdit.id);

                } else {

                    console.log('error', 'patch rejected!! edit.serverVersion: ', edit.serverVersion, '-> clientDoc.shadow.serverVersion: ', clientDoc.shadow.serverVersion, ': edit.localVersion',
                                edit.localVersion, '-> clientDoc.shadow.localVersion: ', clientDoc.shadow.localVersion);

                }

            });

            // Send the server changes
            sendServerChanges(doc, clientDoc, socket, send);

        });
    };

    /**
     * Send the server changes to the clients
     *
     * @param {object}   doc        The document of this arrangement and metadata
     * @param {object}   clientDoc  The clients version of the document
     * @param {socket}   socket     The client's socket
     * @param {function} send        The callback function
     */
    var sendServerChanges = function(doc, clientDoc, socket, send){

        // Create a diff from the current server version to the client's shadow
        // important: use deepcopied versions
        var diff = jsondiffpatch.diff(deepCopy(clientDoc.shadow.doc), deepCopy(doc.serverCopy));
        var basedOnServerVersion = clientDoc.shadow.serverVersion;

        // Check if diff is empty
        if (!_.isEmpty(diff)) {

            // Add the difference to the server's edit stack
            clientDoc.edits.push({
              serverVersion: basedOnServerVersion,
              localVersion: clientDoc.shadow.localVersion,
              diff: diff
            });

            // Update the server version
            clientDoc.shadow.serverVersion++;
        }

        // apply the patch to the server shadow
        jsondiffpatch.patch(clientDoc.shadow.doc, diff);

        // Get the user count
        var noOfUsers = doc.registeredSockets.length;

        send({
            localVersion: clientDoc.shadow.localVersion,
            userCount: noOfUsers,
            serverVersion: basedOnServerVersion,
            edits: clientDoc.edits
        });
    };

    /**
     * Save a snapshot of the clients document to the database
     *
     * @param {string} id  The id of document to be saved
     */
    var saveSnapshot = function(id) {
        getDoc(id, function(doc) {
            save(doc.serverCopy);
        });
    };

    /**
     * Save to the database
     *
     * @param {object} doc  The document to be saved
     */
    var save = function(doc) {

        // Find the the arrangement and update it with copy passed in
        Arrangement.findByIdAndUpdate(
            doc._id,
            { $set: doc },
            function (err, result) {
                // Check for error
                if (err) {
                    // Log the error
                    console.log(err);
                }
            }
        );
    };

    /**
     * Remove the socket from registered sockets of a document and save it if
     * is the last person connected
     *
     * @param {socket} socket  The socket wanting to disconnect from doc
     */
    var disconnectSocketFromDocs = function (socket) {

        // Iterate all documents
        for (var id in allDocuments) {

            // Get the document
            var doc = allDocuments[id];

            // Get index of this socket from the document's registered sockets
            var index = doc.registeredSockets.indexOf(socket);

            // Check if the current socket is listed from the doc and remove it
            if (index >= 0) {
                if (doc.registeredSockets.length === 1) {
                    doc.registeredSockets = []
                } else {
                    doc.registeredSockets = doc.registeredSockets.slice(index, index + 1);
                }
            }

            // Get the user count
            var noOfUsers = doc.registeredSockets.length;

            // Broadcast new user count to users
            socket.broadcast.emit('update-user-count', {userCount: noOfUsers});

            // If it was the last connected socket save it to db
            if(doc.registeredSockets.length === 0){
                saveSnapshot(id);
            }
        }
    };

    /**
     * Handle in coming connections
     */
    var socketHandler = function(socket) {

        // Get the latest document
        socket.on('get-latest-document', function(docId, send) {
            // Register the socket on the document
            registerSocketFor(docId, socket, function(){
                // Send the most current version to the client
                sendCurrentServerVersion(docId, socket.id, send);
            });
        });

        // On client sending an edit
        socket.on('send-edit', function (editMessage, send) {
            // Server recieved edit
            receiveEdit(editMessage, socket, send);
        });

        // On disconnect remove client from doc
        socket.on('disconnect', function () {
            disconnectSocketFromDocs(socket);
        });

    };

    // Allow for delay in saving
    save = _.debounce(save, 1000);

    // On socket connect
    socketIO.on('connection', socketHandler);
};

module.exports = Synchronise;

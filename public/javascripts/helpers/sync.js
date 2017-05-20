var arrangement = require('../model/arrangement');
var jsondiffpatch = require('jsondiffpatch');
var WindowUpdater = require('../windowupdater');
var deepClone = require('../helpers/deepclone');
var _ = require('underscore')._;

/**
 * Constructor
 *
 * @param   {socket.io|socket} socket         The socket that the client is connected through
 * @param   {string}           arrangementId  The ID of the arrangement that it is syncing with
 * @returns {sync}                            Instance of self
 */
var sync = function (WindowUpdater, socket, arrangementId, userId) {

    // Init a document that gets passed between server and client
    this.doc = {
        localVersion: 0,
        serverVersion: 0,
        shadow: {},
        localCopy: {},
        edits: []
    }

    // Flag to ensure for single syncing at a time
    this.syncing = false;

    // Flag to check if arrangement has been initialised
    this.initialised = false;

    // Flag to check if a edits are to be scheduled
    this.scheduled = false;

    // Set the socket
    this.socket = socket;

    // User count
    this.userCount = 0;

    // Class's instance of window updater
    this.windowUpdater = WindowUpdater;

    // Set the arrangement Id
    this.arrangementId = arrangementId;

    // Set up object comparison
    jsondiffpatch = jsondiffpatch.create({
        objectHash: function(obj) {
            return obj.id || JSON.stringify(obj);
        },
        textDiff: {
            minLength: 10000000000000
        }
    });

    // Set this sync variable in the arrangement class
    arrangement.setSync(this);

    /**
     * When Initialising class, get the latest arrangement to init the client
     *
     * @returns {this}   Implement fluent interface
     */
    this.initArrangement = function () {

        // Check if initialised
        if (this.isInitialised()) {
            return false;
        }

        // Get the latest document
        this.getLatestDocument();

        // Implement fluent interface
        return this;
    };

    /**
     * Send the client changes
     */
    this.sendEditMessage = function (editMessage) {
        // Send the message to the other sockets and handle the incoming return message
        this.socket.emit('send-edit', editMessage, function(serverEdits) {
            this.applyServerEdits(serverEdits);
        }.bind(this));
    };

    /**
     * Gets the latest document from the server
     */
    this.getLatestDocument = function () {

        // Check if already syncing
        if (this.isSyncing()) {
            return false;
        }

        // Start syncing with server
        this.syncing = true;

        // Request the latest document
        this.socket.emit('get-latest-document', arrangementId, this.initLocalVersion.bind(this));

        // If the user id is set, add the user to collaborators of the document
        if (false != userId) {
            this.socket.emit('add-user-to-collaborators', arrangementId, userId);
        }

    };

    /**
     * Initialise the local version of the document
     *
     * @params {object} latestVersion  The latest version of the document from the server
     */
    this.initLocalVersion = function (latestVersion) {

        // Not syncing any more
        this.syncing = false;

        // Init the client side document
        this.doc.localCopy = deepClone(latestVersion.doc);
        this.doc.shadow = deepClone(latestVersion.doc);
        this.doc.serverVersion = latestVersion.version;
        this.userCount = latestVersion.userCount;

        // Initialised this client
        this.initialised = true;

        // Set the local arrangement
        arrangement.setArrangement(this.doc.localCopy);

        // Set the local arrangement to window updater
        this.windowUpdater.initialise(this.doc.localCopy);
        this.windowUpdater.updateUserCount(this.userCount);

        // listen to incoming updates from the server
        this.socket.on('updated-document', this.syncWithServer.bind(this));

        // Listen for people joining or leaving
        this.socket.on('update-user-count', this.updateUserCount.bind(this));

        // listen to errors and reload
        this.socket.on('no-client-doc', function(message){
            window.location.reload();
        });
    };

    /**
     * Apply all edits from the server
     */
    this.applyServerEdits = function(serverEdits){

        // Check if any edits to apply
        if (serverEdits.edits.length == 0) {
            // No edits, don't sync
            this.syncing = false;
            this.scheduled = false;

            return this;
        }

        // Check if versions match and there is edits to apply
        if (serverEdits && serverEdits.localVersion == this.doc.localVersion){

            // Delete all previous edits
            this.doc.edits = [];

            // Iterate over all edits
            serverEdits.edits.forEach(this.applyServerEdit.bind(this));

        } else {
            console.log('rejected patch because localVersions don\'t match');
        }

        // Not syncing anymore
        this.syncing = false;
        this.scheduled = false;
    };

    /**
     * Apply the individual edit from the server to the client doc
     */
    this.applyServerEdit = function(edit) {

        // Check the version numbers
        if (edit.localVersion == this.doc.localVersion &&
            edit.serverVersion == this.doc.serverVersion) {
            // Versions match

            // Patch the shadow
            jsondiffpatch.patch(this.doc.shadow, edit.diff);

            // Check if there is a diff
            if (!_.isEmpty(edit.diff)) {
                // Is an edit increase the version number for the
                // shadow
                this.doc.serverVersion++;
            }

            // Apply the patch to the local document
            jsondiffpatch.patch(this.doc.localCopy, deepClone(edit.diff));

            // Set the arrangement
            arrangement.setArrangement(this.doc.localCopy);

            // Update the window
            this.windowUpdater.update(this.doc.localCopy);

        } else {
            console.log('patch from server rejected, due to not matching version numbers');
        }
    };

    /**
     * Creates the send edit message
     */
    this.createSendEditMessage = function (localBaseVersion) {
        return {
            id: this.doc.localCopy._id,
            edits: this.doc.edits,
            localVersion: localBaseVersion,
            serverVersion: this.doc.serverVersion
        };
    }

    /**
     * Add the edit to the list of edits in the doc
     */
    this.addEdit = function(diff, baseVersion){

      this.doc.edits.push({
        serverVersion: this.doc.serverVersion,
        localVersion: baseVersion,
        diff: diff
      });

      // Update the local version number
      this.doc.localVersion++;
    };

    /**
     * Checks whether the client is already syncing
     *
     * @returns {bool} syncing  The flag to check if it is syncing
     */
    this.isSyncing = function () {
        return this.syncing;
    };

    /**
     * Checks whether or not a sync has been scheduled
     *
     * @returns {bool} scheduled The flag to check if it has been scheduled
     */
    this.isScheduled = function () {
        return this.isScheduled;
    };

    /**
     * Checks whether document has been initialised already
     *
     * @returns {bool} initialised  The flag to check if it has been initialised
     */
    this.isInitialised = function () {
        return this.initialised;
    };

    /**
     * Sync document with server
     *
     * @returns {this}  Implements fluent interface
     */
    this.syncWithServer = function () {

        // Check if syncing or if it isn't initialised
        if (this.isSyncing() || !this.isInitialised()) {
            // Don't sync
            return false;
        }

        // Set syncing
        this.syncing = true;

        // Create a diff of the local copy and the shadow copy
        var diff = jsondiffpatch.diff(deepClone(this.doc.shadow), deepClone(this.doc.localCopy));

        // Create running copy of local version number
        var localBaseVersion = this.doc.localVersion;

        // Check if there is a diff
        if (!_.isEmpty(diff)) {
            // Diff made, add edit
            this.addEdit(diff, localBaseVersion);
        }

        // Create the send edit message
        var editMessage = this.createSendEditMessage(localBaseVersion);

        // Apply the the diff to the shadow document
        jsondiffpatch.patch(this.doc.shadow, diff);

        // Send to the server
        this.sendEditMessage(editMessage);

        // Implement fluent interface
        return this;

    };

    /**
     * Schedules a server-sync
     */
    this.scheduleSync = function () {

        // Check if already scheduled
        if (this.isScheduled()) {
            return;
        }

        // Schedule sync
        this.scheduled = true;
        this.syncWithServer();

    };

    /**
     * Update the user count
     */
    this.updateUserCount = function (userCount) {
        this.windowUpdater.updateUserCount(userCount.userCount);
    };

    // Initialise 
    this.initArrangement();

    // Allow 50 millisecond delay before execution to allow for data to arrive
    this.syncWithServer = _.debounce(this.syncWithServer.bind(this), 50);

    // Update client every 5 seconds
    setInterval(this.scheduleSync.bind(this), 5000);

    // Implement fluent interface
    return this;
};

/**
 * Add a change to be sync'd
 *
 * @param {object} arrangement  The updated client version of the arrangement
 */
sync.prototype.addChange = function (arrangement) {

    // Change to arrangement made update the local copy
    this.doc.localCopy = deepClone(arrangement);

    // Sync with the server
    this.syncWithServer();

    // Implements fluent interface
    return this;
};

module.exports = sync;

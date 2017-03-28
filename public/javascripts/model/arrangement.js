var proxify = require('../helpers/proxify');

/**
 * Arrangement singleton class that holds all tracks and their information
 */
module.exports = {

    /**
     * Arrangement struct to hold all track
     * {
     *    id: 'id',
     *    tracks: {objects},
     *    bpm: 
     * }
     */
    arrangement: {
        id: null,
        tracks: [],
        bpm: 120
    },
    sync: null,
    addTrack: function (track) {

        // Set flag for track being found or not
        var found = false;

        // Loop all of the tracks in the arrangement
        this.arrangement.tracks.forEach(function (existingTrack) {

            // Check if the id of the track being passed in is same as current exisiting track
            if (track.id == existingTrack.id) {
                // Track found
                found = true;
            }
        });

        // Check if track was found
        if (!found) {
            // Wasn't found

            // Add a track to the arrangements
            this.arrangement.tracks.push(track);

            // Sync with client
            this.syncClientToServer();

        }

    },
    setBpm: function (bpm) {

        // Set the bpm of the arrangement
        this.arrangement.bpm = bpm;

        this.syncClientToServer();
    },
    replaceTrack: function (track) {

        // Reference to self
        var self = this;

        // Loop all of the tracks in the arrangement
        this.arrangement.tracks.forEach(function (existingTrack) {

            // Check if the id of the track being passed in is same as current exisiting track
            if (track.id == existingTrack.id) {
                // Ids match, replace the track
                self.arrangement.tracks[existingTrack] = track;
            }

        });

        this.syncClientToServer();
    },
    setSync: function (sync) {
        // Dependancy injection for the sync class
        this.sync = sync;
    },
    syncClientToServer: function () {
        // Sync the changes applied from the subsequent functions to the server
        this.sync.addChange(this.arrangement);
    },
    setId: function (arrangementId) {
        this.arrangement.id = arrangementId;
    },
    getId: function () {
        return this.arrangement.id;
    },
    setArrangement: function (arrangement) {
        this.arrangement = arrangement;
    },
    getArrangement: function () {
        return this.arrangement;
    }
};

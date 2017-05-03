var deepClone = require('../helpers/deepclone');

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

        // Iterate all tracks in the arrangement
        for (var i = 0; i < this.arrangement.tracks.length; i++) {

            // Check if the id of the track being passed in is same as current exisiting track
            if (track.id == this.arrangement.tracks[i].id) {
                // Track found
                found = true;
                break;
            }
        }

        // Check if track was found
        if (!found) {
            // Wasn't found
            // Add a track to the arrangements
            this.arrangement.tracks.push(track);

            // Sync with client
            this.syncClientToServer();
        }

    },
    deleteTrack: function (trackId) {

        // Iterate all the tracks
        for (var i = 0; i < this.arrangement.tracks.length; i++) {

            // Check if current track is the track to delete
            if (trackId == this.arrangement.tracks[i].id) {
                // Delete the track and exit the loop

                this.arrangement.tracks.splice(i, 1);

                // Sync with client
                this.syncClientToServer();

                break;
            }
        }
    },
    setBpm: function (bpm) {

        // Set the bpm of the arrangement
        this.arrangement.bpm = bpm;

        this.syncClientToServer();
    },
    getBpm: function () {
        // Get the bpm of the arrangement
        return this.arrangement.bpm;
    },
    replaceTrack: function (track) {

        // Reference to self
        var self = this;

        // Loop through and replace the track
        this.arrangement.tracks = this.arrangement.tracks.map(function (existingTrack) {
            // If track ids match, replace the track with a deep clone
            return track.id == existingTrack.id ? deepClone(track) : existingTrack;
        });

        // Sync with server
        this.syncClientToServer();
    },
    setSync: function (sync) {
        // Dependancy injection for the sync class
        this.sync = sync;
    },
    syncClientToServer: function () {
        // Sync the changes applied from the subsequent functions to the server
        this.sync.addChange(deepClone(this.arrangement));
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

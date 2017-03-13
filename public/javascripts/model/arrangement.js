var guid = require('../helpers/idgenerator');
var sync = require('../helpers/sync');
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
        id: guid(),
        tracks: [],
        bpm: 120
    },
    addTrack: function (track) {

        // Add a track to the arrangements
        this.arrangement.tracks.push(track);

        console.log('addTrack');
        this.sync();
    },
    setBpm: function (bpm) {

        // Set the bpm of the arrangement
        this.arrangement.bpm = bpm;

        console.log('setBPM');
        this.sync();
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
        console.log('replaceTrack');
        this.sync();
    },
    sync: function () {
        console.log('sync');
        /**
         * All methods call this
         * sends the arrangement to the server to be broadcasted to the other clients
         */
    }
};

/**
 * Functions:
 *  MUST HAVE:
 *  - adding the proxy to the arrangement struct
 *  - adding a track to the arrangement
 *  - making the changes reflected in step sequencer in the pattern
 *          - the step sequencer needs to have a set pattern function
 *              - everytime it is changes it sets the pattern
 *              - everytime the pattern changes it sets what is used in the sequence
 *                      - potentially if you convert the array to 0/1 it reflects in the front end
 *
 *  SHOULD HAVE:
 *  - Getting the track by id
 *  - getting the arrangement by id
 */

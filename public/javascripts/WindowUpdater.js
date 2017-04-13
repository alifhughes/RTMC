var $ = require('jquery');
var deepClone = require('./helpers/deepclone');
var _ = require('underscore')._;
var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');
var jsondiffpatch = require('jsondiffpatch');

/**
 * Gets called from the sync class
 * It needs to:
 * - set the changes of the arrangement to all existing sequences
 * - add more sequences
 * - delete sequences
 * - increase the volume of sequences
 * - set the pattern within sequences
 * - set bpm of the arrangement
 *
 * @param {MasterControls} MasterControls  Instance of Master controls to add
 *                         new tracks
 */
var WindowUpdater = function (MasterControls) {

    // Init arrangement object
    this.arrangement = {
        _id: "",
        bpm: 120,
        type: "arrangement",
        name: "",
        ownerId: "",
        __v: 0,
        tracks: [],
        contributors: []
    };

    // Reference to this
    var self = this;

    // Initiliasation flag
    this.isInitialised = false;

    // Init instrument factory
    this.instrumentFactory = new InstrumentFactory();

    // Init class instance of master controls
    this.masterControls = MasterControls;

    // Set up object comparison
    jsondiffpatch = jsondiffpatch.create({
        objectHash: function(obj) {
            return obj.id || JSON.stringify(obj);
        }
    });

    /**
     * Updates the bpm input field
     *
     * @param {int} bpm  The bpm of the arrangement
     * @returns {WindowUpdater} this  Instance of self
     */
    this.updateBpm = function (bpm) {

        // Get the DOM element
        var bpmElement = $('#bpm');

        // Reset the value of the bpm
        bpmElement.attr("value", bpm);

        // Set the text value of input field
        bpmElement.text(bpm);

        // Update the master controls
        this.masterControls.updateBpm(bpm);

        // Implement fluent interface
        return this;
    };

    /**
     * Initialise the tracks in the window
     *
     * @param {object} track  The track to initialise
     */
    this.addTrack = function (track) {

        // Get the type
        var type = track.type;
        var id = track.id;

        // Create the instrument selected
        self.instrumentFactory.createInstrument(type, id).then(function(instrumentContainer) {

            // Push the sequence on to the sequences
            instrumentContainer.seq.setTrackJSON(track);
            self.masterControls.addTrack(instrumentContainer.seq);

        });

    };

    /**
     * Delete the track from the window
     *
     * @param {object} track  The track to delete
     */
    this.deleteTrack = function (track) {

        // Get the id
        var deletedTrackId = track.id;

        // Iterate all the instruments
        $('#instrumentTracks > .instrument-container').each(function() {

            // Get the current iteration's track id
            var currTrackId = $(this).attr('id');

            // Check if the ids are the same
            if (currTrackId == deletedTrackId) {
                // Delete the track

                $(this).remove();
                return false;
            }
        });

        // Remove it from the list of sequeces in the master controls
        self.masterControls.deleteTrackById(deletedTrackId);

    };

    /**
     * Updates the tracks in the arrangement accordingly
     */
    this.updateTracks = function (tracks) {

        // Check if initilised
        if (this.isInitialised == false) {

            // Not initalised, create all tracks
            tracks.map(this.addTrack);

        } else if (tracks.length > this.arrangement.tracks.length) {
            // A track needs to be added

            // Get how many tracks to add
            var noOfTracksToAdd = tracks.length - this.arrangement.tracks.length;

            // Get the tracks to add
            var tracksToAdd = tracks.splice((tracks.length - 1), noOfTracksToAdd);

            // Add the tracks
            tracksToAdd.map(this.addTrack);

        } else if (tracks.length < this.arrangement.tracks.length) {

            // Make a working copy of the tracks
            var tracksToDelete = deepClone(this.arrangement.tracks);

            // Loop through each track checking if their equal to exisiting tracks
            this.arrangement.tracks.forEach(function (existingTrack, index) {

                // Loop through tracks passed in
                tracks.forEach(function (newTrack) {

                    // Check if tracks are the same
                    if (existingTrack.id == newTrack.id) {
                        // Tracks match, delete it from working copy
                        tracksToDelete.splice(index, 1);
                        return;
                    }

                });
            });

            // Delete the tracks remaining tracks found in the class's
            // working copy of the tracks from the window
            tracksToDelete.map(this.deleteTrack);


        } else {
            // No tracks added or deleted, an internal change to the tracks

            // Loop through each track checking if their equal to exisiting tracks
            this.arrangement.tracks.forEach(function (existingTrack) {

                // Loop through tracks passed in
                tracks.forEach(function (newTrack) {

                    // Check if tracks are the same
                    if (existingTrack.id != newTrack.id) {
                        // Not the same, skip
                        return;
                    }

                    // Tracks are the same, check if objects are equal
                    if (!_.isEqual(existingTrack, newTrack)) {
                        // Tracks are different
                        // Get the track, object
                        var trackToUpdate =
                            self.masterControls.getTrackById(newTrack.id);

                        // Set the new track json
                        trackToUpdate.setTrackJSON(newTrack);
                    }
                });
            });
        }

    };

};

/**
 * Updates the window objects effected by the arrangement being changed
 *
 * @param {object} arrangement  The newly updated arrangement
 */
WindowUpdater.prototype.update = function (arrangement) {

    // Check if bpm has changed
    if (!_.isEqual(this.arrangement.bpm, arrangement.bpm)) {
        // set the bpm of window
        this.updateBpm(arrangement.bpm);
    }

    // Check tracks diff
    if (!_.isEqual(this.arrangement.tracks, arrangement.tracks)) {
        // Update tracks
        this.updateTracks(arrangement.tracks);
    }

    // Reset the local copy of arrangement
    this.arrangement = deepClone(arrangement);

    // Implement fluent interface
    return this;

};

/**
 * Reset the arrangement, used when creating track locally
 *
 * @param {object} arrangement  The local updated arrangement
 */
WindowUpdater.prototype.setArrangement = function (arrangement) {
    this.arrangement = arrangement
};

/**
 * Inits the arrangement so diffs can made and sets up window
 *
 * @param {object} arrangement  The initialised arrangement
 */
WindowUpdater.prototype.initialise = function (arrangement) {

    // Update the window
    this.updateBpm(arrangement.bpm);
    this.updateTracks(arrangement.tracks);

    // Set is initialised
    this.isInitialised = true;

    // Set instance of self in master controls
    this.masterControls.setWindowUpdater(this);

    // Set the local copy of arrangement
    this.arrangement = deepClone(arrangement);


};

module.exports = WindowUpdater;

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
        stepsLength: 16,
        ownerId: "",
        __v: 0,
        tracks: [],
        contributors: []
    };

    // Reference to this
    var self = this;

    // Initiliasation flag
    this.isInitialised = false;

    // User count
    this.userCount = 0;

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

        // Check if synth being added
        if ('synth' == type) {
            self.masterControls.updateSynthCount();
        }

        // Create the instrument selected
        self.instrumentFactory.createInstrument(type, id).then(function(instrumentContainer) {

            // Push the sequence on to the sequences
            instrumentContainer.seq.setTrackJSON(track);

            // Check the length of the arrangement and track
            if (32 == self.arrangement.stepsLength && 0 == track.pattern.length) {
                // Track length isn't set, set it
                instrumentContainer.seq.lengthenTrack();
            } else if (16 == self.arrangement.stepsLength && 0 == track.pattern.length) {
                // Track length isn't set, set it
                instrumentContainer.seq.shortenTrack();
            }

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
        // // Is playing, queue the instrument to start
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

            // Get the diff between the tracks
            var diff = jsondiffpatch.diff(deepClone(tracks), deepClone(this.arrangement.tracks));

            // Get the tracks to delete which is first value of the diff object
            var tracksToDelete = diff[Object.keys(diff)[0]];

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

    // Check if arrangement length has changed
    if (!_.isEqual(this.arrangement.stepsLength, arrangement.stepsLength)) {
        // Set the master controls steps length
        this.masterControls.setStepsLength(arrangement.stepsLength);
    }

    // Check tracks diff
    if (!_.isEqual(this.arrangement.tracks, arrangement.tracks)) {
        // Update tracks
        this.updateTracks(arrangement.tracks);
    }

    // Check if the length has changed but the tracks haven't
    if (!_.isEqual(this.arrangement.stepsLength, arrangement.stepsLength)
        && _.isEqual(this.arrangement.tracks, arrangement.tracks)) {
        // BUG FIX
        // - tracks aren't reconginsing when the other client
        //   changes the length
        this.toggleLength(this.masterControls.getTracks());
    }

    // Reset the local copy of arrangement
    this.arrangement = deepClone(arrangement);


    // Implement fluent interface
    return this;

};

/**
 * Update the user count on the window
 *
 * @param {int} userCount  The count of the users joined
 */
WindowUpdater.prototype.updateUserCount = function (userCount) {

    // Check if user count has changed
    if (!_.isEqual(this.userCount, userCount)) {
        $('#userCounter').text(userCount);
    }
};

/**
 * Toggle the length arrangement
 *
 * @param {array} tracks  All the tracks of the arragnement
 */
WindowUpdater.prototype.toggleLength = function (tracks) {

    // Init string for method name
    var methodName = '';

    // Check the length of the arrangement
    if (this.arrangement.stepsLength == 16) {
        // Set the method name depending on length
        methodName = 'lengthenTrack';

        // Set the length
        this.arrangement.stepsLength = 32;

    } else {
        methodName = 'shortenTrack';

        // Set the length
        this.arrangement.stepsLength = 16;
    }

    // Loop through all the tracks
    for (var i = 0; i < tracks.length; i++) {

        // Check the track type
        if ('step-sequencer' != tracks[i].getTrackType()) {
            // Not a step sequencer, skip
            continue;
        }

        // Call the method on the track, and push the changes
        tracks[i][methodName](true);

    }

    // Set the master controls steps length
    this.masterControls.setStepsLength(this.arrangement.stepsLength);

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

    // Set the master controls steps length
    this.masterControls.setStepsLength(this.arrangement.stepsLength);

    // Hide the loading overlay
    $('#loadOverlay').hide();

};

module.exports = WindowUpdater;

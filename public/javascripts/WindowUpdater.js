var $ = require('jquery');
var deepClone = require('./helpers/deepclone');
var _ = require('underscore')._;
var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');

/**
 * Gets called from the sync class
 * It needs to:
 * - set the changes of the arrangement to all existing sequences
 * - add more sequences
 * - delete sequences
 * - increase the volume of sequences
 * - set the pattern within sequences
 * - set bpm of the arrangement
 */
var WindowUpdater = function () {

    // Init arrangement object
    this.arrangement = {};

    // Initiliasation flag
    this.isInitialised = false;

    // Init instrument factory
    var instrumentFactory = new InstrumentFactory();

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

        // Create the instrument selected
        instrumentFactory.createInstrument(type).then(function(instrumentContainer) {

            // Push the sequence on to the sequences
            //sequences.push(instrumentContainer.seq);
            instrumentContainer.seq.setTrackJSON(track);

        });

    };

    /**
     * Updates the tracks in the arrangement accordingly
     */
    this.updateTracks = function (tracks) {

        console.log('tracks', tracks);

        // Check if initilised
        if (this.isInitialised == false) {

            console.log('not initialised');

            // Not initalised, create all tracks
            this.arrangement.tracks.map(this.addTrack);

        } else if (tracks.length > this.arrangement.tracks.length) {
            // A track needs to be added
            console.log('add a track');

            // Get how many tracks to add
            var noOfTracksToAdd = tracks.length - this.arrangement.tracks.length;

            // Get the tracks to add
            var tracksToAdd = tracks.splice((tracks.length - 1), noOfTracksToAdd);

            // Add the tracks
            tracksToAdd.map(this.addTrack);
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

    console.log('this.arrangement.tracks', this.arrangement.tracks);
    console.log('arrangement.tracks', arrangement.tracks);
    console.log('isEqual', !_.isEqual(this.arrangement.tracks, arrangement.tracks));

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
 * Inits the arrangement so diffs can made and sets up window
 *
 * @param {object} arrangement  The initialised arrangement
 */
WindowUpdater.prototype.initialise = function (arrangement) {
    console.log('arrangement', arrangement);

    // Set the local copy of arrangement
    this.arrangement = deepClone(arrangement);

    // Update the window
    this.updateBpm(arrangement.bpm);
    this.updateTracks(arrangement.tracks);

    // Set is initialised
    this.isInitialised = true;

    console.log('initialised');

};

module.exports = WindowUpdater;

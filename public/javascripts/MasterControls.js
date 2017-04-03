var $ = require('jquery');
var Tone = require('tone');
var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');

/**
 * the window updator must know about the master controls
 *  - when it creates tracks, it needs to add them to these tracks
 */

/**
 * Constructor, it controls:
 * - Getting/Setting bpm
 * - Control of sequences, starting, stopping, etc
 * - Adding an instrument
 *
 * @param  {object}         arrangement  The arrangement data structure
 * @return {MasterControls}              Instance of self
 */
var MasterControls = function (arrangement) {

    // Array to hold a the objects of the tracks
    this.tracks = [];

    // Int to hold bpm
    this.bpm = $('#bpm').attr("value");

    // Reference to self
    var self = this;

    // Create instance of instrument factory
    this.instrumentFactory = new InstrumentFactory();

    /**
     * Add event listener for the bpm slider
     */
    $('#bpm').on('input', function(event) {

        // Check if bpm is set
        if ('' !== event.target.value) {

            // Get the bpm value
            bpm = parseInt(event.target.value);

            // Set the BPM value
            Tone.Transport.bpm.value = bpm;

            // Set the bpm of the arrangement
            arrangement.setBpm(bpm);
        }

    });

    /**
     * Event listener for starting the playback
     */
    $('#start').on('click', function() {

        // Loop all the tracks
        self.tracks.forEach(function(track) {

            // Start the track
            track.start();

        });
    });

    /**
     * Event listener for stopping the playback
     */
    $('#stop').on('click', function() {

        // Loop all the tracks
        self.tracks.forEach(function(track) {

            // Stop the track
            track.stop();

        });

    });

    /**
     * Event listener for adding an instrument
     */
    $('#addInstrument').on('click', function () {

        // Get the selected instrument from the drop down
        var instrument = $('#instruments').val();

        // Create the instrument selected
        self.instrumentFactory.createInstrument(instrument, false)
            .then(function(instrumentContainer) {

                // Push the track on to the tracks
                self.tracks.push(instrumentContainer.seq);

            });

    });

    // Return instance of self
    return this;
};

/**
 * Add track to list of class tracks
 *
 * @param {Object} track  Sequencer/score track
 */
MasterControls.prototype.addTrack = function (track) {

    // Push track to list of tracks
    this.tracks.push(track);

};

/**
 * Return track from list by id
 *
 * @param {String}       id     Track id
 * @return {object|bool} track  The track or false if not found
 */
MasterControls.prototype.getTrackById = function (id) {

    // Loop through tracks
    var track = this.tracks.reduce(function (track) {

        // Check if ids match
        if (track.id == id) {

            // ids match, return track
            return track;
        }

        // Not found
        return;
    });

    // Check if variable is set
    if (typeof track === 'undefined' || !track) {
        // Not set, return false
        return false;
    }

    // Return the found track
    return track;
};

module.exports = MasterControls;

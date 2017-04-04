var $ = require('jquery');
var Tone = require('tone');
var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');

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

    // Local instance of window updater
    this.windowUpdater = false;

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

                // Initialise track locally
                instrumentContainer.seq.setInitialised();

                // Add it to the arrangement and reset the local copy of window's arrangment
                arrangement.addTrack(instrumentContainer.seq.getTrackJSON());
                self.windowUpdater.setArrangement(arrangement.getArrangement());

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
 * Setter for local copy of window updater
 *
 * @param {WindowUpdater} windowUpdater Instance of the class
 */
MasterControls.prototype.setWindowUpdater = function (windowUpdater) {
    this.windowUpdater = windowUpdater;
};

/**
 * Return track from list by id
 *
 * @param {String}       id     Track id
 * @return {object|bool} track  The track or false if not found
 */
MasterControls.prototype.getTrackById = function (id) {

    // Loop through tracks
    for (var i = 0; i < this.tracks.length; i++) {

        // Check if ids match
        if (this.tracks[i].id == id) {

            // ids match, return track
            var track = this.tracks[i];
        }
    }

    // Check if variable is set
    if (typeof track === 'undefined' || !track) {
        // Not set, return false
        return false;
    }

    // Return the found track
    return track;
};

/**
 * Update the Tone bpm value when syncing with server
 *
 * @param  {int}            bpm  The newly updated bpm of track
 * @return {MasterControls}      Implement fluent interface
 */
MasterControls.prototype.updateBpm = function (bpm) {

    // Get the bpm value
    bpm = parseInt(bpm);

    // Set the BPM value
    Tone.Transport.bpm.value = bpm;

    // Implement fluent interface
    return this;
};

module.exports = MasterControls;

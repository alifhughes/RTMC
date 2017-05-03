var Clipboard = require('clipboard');
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

    // Play back bool
    this.playing = false;

    // Reference to self
    var self = this;

    // Own sequencer for tracking purposes
    this.masterControlsSeq = new Tone.Sequence(function(time, col) {
        // when the loop starts again, play the queued tracks
        if (0 == self.masterControlsSeq.progress) {
            self.triggerQueuedTracks();
        }
    }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n');

    // Running array that keeps tracks that are queued to start
    this.queuedToStartTracks = [];

    // Create instance of instrument factory
    this.instrumentFactory = new InstrumentFactory();

    // Init share button on click
    this.shareBtn = new Clipboard('#shareUrl');

    // On copy success
    this.shareBtn.on('success', function (e) {

        // Change the text
        $('#shareUrl').html('Copied to clipboard!');

        // Set text to change back after timeout
        setTimeout(function () {

            // Change text back
            $('#shareUrl').html('Share the URL ');

            // Recreate icon
            var shareIcon = document.createElement("i");
            shareIcon.className = "fa fa-share-square-o";
            $('#shareUrl').append(shareIcon);

        }, 4000);
    });

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
    $('#start-stop').on('click', function() {

        // Set the playing toggle
        self.playing == true ? self.playing = false : self.playing = true;

        // Toggle the stop class on
        $(this).toggleClass('fa-play-circle fa-stop-circle');

        // Check if playing
        if (self.playing == true) {

            // Loop all the tracks
            for (var i = 0; i < self.tracks.length; i++) {

                // Start the track
                self.tracks[i].start();
                self.masterControlsSeq.start();

            }

        } else {

            // Loop all the tracks
            for (var i = 0; i < self.tracks.length; i++) {

                // Start the track
                self.tracks[i].stop();
                self.masterControlsSeq.stop();

            }

        }

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

                if (self.playing) {
                    self.addTrackToQueue(instrumentContainer.seq);
                }

            });
    });

    /**
     * Event handler for the deleting of a track
     */
    $(document).on('click', 'i.delete-track', function () {

        // Get the track id to be deleted
        var trackId = $(this).attr('track-id');

        // Delete track from list of tracks
        self.deleteTrackById(trackId);

        // Iterate all the instruments
        $('#instrumentTracks > .instrument-container').each(function() {

            // Get the current iteration's track id
            var currTrackId = $(this).attr('id');

            // Check if the ids are the same
            if (currTrackId == trackId) {
                // Delete the track
                $(this).remove();
                return false;
            }
        });

        // Remove track from arrangement
        arrangement.deleteTrack(trackId);

        // delete the arrangement and reset the local copy of window's arrangment
        self.windowUpdater.setArrangement(arrangement.getArrangement());

    });

    /**
     * Stop a single track that is playing by finding from id
     *
     * @param {string} id  The ID of track that needs to be stopped
     */
    this.stopTrackPlaybackById = function (trackId) {

        // Iterate all the tracks
        for (var i = 0; i < this.tracks.length; i++) {

            // Check if track matches one passed in
            if (trackId == this.tracks[i].id) {
                // Found track to stop
                this.tracks[i].stop();
            }
        }

    };

    /**
     * Start a single track that is playing by finding from id
     *
     * @param {string} id  The ID of track that needs to be started
     */
    this.startTrackPlaybackById = function (trackId) {

        // Iterate all the tracks
        for (var i = 0; i < this.tracks.length; i++) {

            // Check if track matches one passed in
            if (trackId == this.tracks[i].id) {
                // Found track to stop
                this.tracks[i].start();
            }
        }

    };

    /**
     * Queue to start the track when back at start
     *
     * @param {Sequencer} seq  The sequencer track to start
     */
    this.addTrackToQueue = function (seq) {
        //while progress != and playing is still true, start the track
        this.queuedToStartTracks.push(seq);
    };

    /**
     * Trigger the queued tracks to start
     */
    this.triggerQueuedTracks = function () {

        // Iterate all the queued tracks
        for (var i = 0; i < this.queuedToStartTracks.length; i++) {
            // Check if still playing
            if (this.playing) {
                // start the track
                this.queuedToStartTracks[i].start();
            }
        }

        // Reset the array
        this.queuedToStartTracks = [];

    }

    // Return instance of self
    return this;
};

/**
 * Add track to list of class tracks
 *
 * @param {Object}         track  Sequencer/score track
 * @retun {MasterControls}        Instance of self
 */
MasterControls.prototype.addTrack = function (track) {
    // Push track to list of tracks
    this.tracks.push(track);

    // Check if playing
    if (this.playing) {
        this.addTrackToQueue(track);
    }

    // Implement fluent interface
    return this;
};

/**
 * Remove track from list of class tracks by its id
 *
 * @param  {Object}        trackId  Sequencer/score track id
 * @return {MasterControls}         Instance of self
 */
MasterControls.prototype.deleteTrackById = function (trackId) {

    // Check if playing
    if (this.playing) {
        // Is playing, stop before deleting
        this.stopTrackPlaybackById(trackId);
    }

    // Iterate all the tracks
    for (var i = 0; i < this.tracks.length; i++) {

        // Check if current track is the track to delete
        if (this.tracks[i].id == trackId) {
            // Delete the track and exit the loop
            this.tracks.splice(i, 1);
            break;
        }
    }

    // Implement fluent interface
    return this;
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

var Clipboard = require('clipboard');
var $ = require('jquery');
var Tone = require('tone');
var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');
var exportToWav = require('./helpers/exportToWav.js');

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

    // Counter for number of synth tracks
    this.synthTracksCount = 0;

    // Reference to self
    var self = this;

    // Array for 16 steps
    this.seqStepsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    // class variable for length of steps
    this.stepsLength = 16;

    /**
     * Init the tone sequencer of the length specified by array size
     *
     * @return {Tone.Sequence}                 The Tone sequence
     */
    this.initToneSequencer = function () {
        return new Tone.Sequence(function(time, col) {
            // when the loop starts again, play the queued tracks
            if (0 == self.masterControlsSeq.progress) {
                self.triggerQueuedTracks();
            }
        }, self.seqStepsArray, '16n');
    };

    // Own sequencer for tracking purposes
    this.masterControlsSeq = this.initToneSequencer();

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
     * Add event listener for the export button
     */
    $('#exportToWav').on('click', function (event) {

        // Disable the button
        $(this).prop('disabled', true);

        // Give user feedback
        $(this).html('Exporting, please wait..');

        // Show the loading overlay
        $('#loadOverlay').show();

        // Check if playing
        if (self.playing) {
            // Stop the playback
            $('#start-stop').click();
        }

        // Disable playback
        $('#start-stop').prop('disabled', true);

        // Init empty array to hold the audio buffers
        var audioBuffers = [];

        // Iterate all the tracks
        for (var i = 0; i < self.tracks.length; i++) {

            // Get all of the audio buffers from the tracks
            self.tracks[i].getAudioBuffer().then(function (trackAudioBuffer) {
                audioBuffers.push(trackAudioBuffer);

                // Check if last AudioBuffer has been resolved
                if (audioBuffers.length == self.tracks.length) {
                    // Resolved, return the AudioBuffers array
                    return audioBuffers;
                } else {
                    return false;
                }

            }).then(function (allAudioBuffers) {

                // Check the return value
                if (allAudioBuffers != false) {
                    // Value isn't false, all audiobuffers returned
                    var wav = exportToWav(allAudioBuffers, Tone.context);

                    // Create anchor
                    var anchor = document.createElement('a')
                    document.body.appendChild(anchor)
                    anchor.style = 'display: none'
                    var blob = new window.Blob([ new DataView(wav) ], {
                      type: 'audio/wav'
                    })

                    var url = window.URL.createObjectURL(blob)
                    anchor.href = url
                    anchor.download = 'audio.wav'
                    anchor.click()
                    window.URL.revokeObjectURL(url)

                    // Hide the overlay
                    $('#loadOverlay').hide();

                    // Disable the button
                    $('#exportToWav').prop('disabled', false);

                    // Give user feedback
                    $('#exportToWav').html('Export to .wav file ');

                    // Recreate icon
                    var downloadIcon = document.createElement("i");
                    downloadIcon.className = "fa fa-download";
                    $('#exportToWav').append(downloadIcon);

                }
            });
        }

    });

    /**
     * Toggle button event handler for the length
     */
    $('#lengthToggle').on('click', function (event) {

        // Disable the button
        $(this).prop('disabled', true);

        // Give user feedback
        $(this).html('Loading, please wait..');

        // Show the loading overlay
        $('#loadOverlay').show();

        // Check if playing
        if (self.playing) {
            // Stop the playback
            $('#start-stop').click();
        }

        // Disable playback
        $('#start-stop').prop('disabled', true);

        // Toggle the track lengths
        self.windowUpdater.toggleLength(self.tracks);

        // Disable the button
        $(this).prop('disabled', false);

        // Hide the loading overlay
        $('#loadOverlay').hide();

        // Reenable playback
        $('#start-stop').prop('disabled', false);

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

        // Check the track type
        if ('synth' == instrument) {
            // Check how many synth tracks there are
            if (self.synthTracksCount == 3) {
                alert('Maximum number of synth tracks reached');
                return;
            } else {
                // Increment the synth tracks
                self.synthTracksCount++;
            }
        }

        // Create the instrument selected
        self.instrumentFactory.createInstrument(instrument, false)
            .then(function(instrumentContainer) {

                // Push the track on to the tracks
                self.tracks.push(instrumentContainer.seq);

                // Initialise track locally
                instrumentContainer.seq.setInitialised();

                // Check the no of steps
                if (32 == self.stepsLength && 'step-sequencer' == instrument) {
                    //Lengthen the track, dont push changes
                    instrumentContainer.seq.lengthenTrack(false);
                } else if (16 == self.stepsLength && 'step-sequencer' == instrument) {
                    //shorten the track, don't push the changes
                    instrumentContainer.seq.shortenTrack(false);
                }

                // Add it to the arrangement and reset the local copy of window's arrangment
                arrangement.addTrack(instrumentContainer.seq.getTrackJSON());
                self.windowUpdater.setArrangement(arrangement.getArrangement());

                // Check if plying
                if (self.playing) {
                    // Is playing, queue the instrument to start
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

    /**
     * Changes the value of the seq array and seq note
     */
    this.setSeqArray = function () {

        // Check the length of the array as it is
        if (16 == this.stepsLength) {
            // Reset the size of the array and note value
            this.seqStepsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        } else {
            // Reset the size of the array and note value
            this.seqStepsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                                   16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
        }
    };

    /**
     * Toggle the text of the button depending on the length of the track
     */
    this.toggleTrackLengthBtnText = function () {
        // Check the length
        if (16 == this.stepsLength) {
            $('#lengthToggle').html('Extend length of steps');
        } else {
            $('#lengthToggle').html('Shorten length of steps');
        }
    };

    /**
     * Set the arrangement steps length
     */
    this.setArrangementStepsLength = function () {
        // Set the arrangement
        arrangement.setStepsLength(this.stepsLength);
    };

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

            // Check if the track is a synth
            if ('synth' == this.tracks[i].getTrackType()) {
                // Release the web audio
                this.tracks[i].closeAudioContext();
                this.synthTracksCount--;
            }

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
 * Get all the tracks
 *
 * @returns {array} this.tracks  The track objects
 */
MasterControls.prototype.getTracks = function () {
    return this.tracks;
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

/**
 * Update the synth count
 */
MasterControls.prototype.updateSynthCount = function () {
    if (this.synthTracksCount != 3) {
        this.synthTracksCount++;
    }
};

/**
 * Set the steps length, toggle the text in the button
 *
 * @param {int} stepsLength The length of steps
 */
MasterControls.prototype.setStepsLength = function (stepsLength) {

    // Check if playing
    if (this.playing) {
        // Stop the playback
        $('#start-stop').click();
    }

    // Set the length
    this.stepsLength = stepsLength;

    // Toggle the text
    this.toggleTrackLengthBtnText();

    // Set the seq array
    this.setSeqArray();

    // reinit the master controls seq
    this.masterControlsSeq = this.initToneSequencer();

    // Set arrangement steps length
    this.setArrangementStepsLength();

};

module.exports = MasterControls;

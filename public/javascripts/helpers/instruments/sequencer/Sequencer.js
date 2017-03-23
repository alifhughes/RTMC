var Tone = require('tone');
var trigger = require('../../../helpers/trigger');
var guid = require('../../../helpers/idgenerator');
var proxify = require('../../../helpers/proxify');
var arrangement = require('../../../model/arrangement');

// Start the tone timer
Tone.Transport.start();

/**
 * Constructor
 *
 * @returns{sequencer} instance of itself
 */
function sequencer () {

    // Initialise empty matrix
    this.steps;

    //create a synth and connect it to the master output (your speakers)
    this.synth = new Tone.AMSynth().toMaster();

    // Set the bpm default bpm
    Tone.Transport.bpm.value = 120;

    var self = this;

    // Sequence notes
    this.seq = new Tone.Sequence(function(time, col) {

        // Get the array of columns from the matrix
        var column = self.steps.matrix[col];

        if (1 === column[0]) {
            // Trigger synth to play note at the time passed in to the callback
            trigger(self.synth, "C4", '32n');
        }

    }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n');

    /**
     * Track struct
     * {
     *    id: 'id',
     *    type: 'step-sequencer',
     *    volume: 60,
     *    pattern: this.steps.matrix
     * }
     */
    this.createTrackJSON = function () {

        // JSON object container meta data of track
        var track = {
            id: guid(),
            type: 'step-sequencer',
            volume: self.synth.volume.value,
            pattern: []
        };

        return track;
    };

    // Init JSON struct of the track
    this.track = this.createTrackJSON();


    // Add the track to the arrangement
    arrangement.addTrack(this.track);

    /**
     * Proxy that picks up the changes when a step is pressed and sets the track
     * pattern to the steps
     */
    this.setStepsObserver = function () {

        // Proxify the steps
        proxify(this.track, function(object, property, oldValue, newValue) {

            // Set the track pattern
            self.track.pattern = self.steps.matrix;

            // Push the changes of the track to the arrangement
            self.pushChanges();
        });
    };

    /**
     * Push track changes to the arrangement
     */
    this.pushChanges = function () {

        // replace the track in the arrangement with updated track
        arrangement.replaceTrack(this.track);

    };

    return this;
};

/**
 * Start the loop sequence
 */
sequencer.prototype.start = function () {
    // Start the Transport timer
    this.seq.start();
};

/**
 * Stop the loop sequence
 */
sequencer.prototype.stop = function () {
    // Stop the transport timer
    this.seq.stop();
};

/**
 * Set the matrix for the steps sequencer
 *
* @param {DOM} matrix  The matrix DOM that is the steps of the sequencer
 */
sequencer.prototype.setMatrix = function (matrix) {

    // Set the steps
    this.steps = matrix;

    // Set the track pattern
    this.track.pattern = this.steps.matrix;

    // Set the steps observer
    this.setStepsObserver();

};

/**
 * Get the matrix for the steps sequencer
 *
 * @returns {matrix} steps  The steps for the sequencer
 */
sequencer.prototype.getMatrix = function () {
    return this.steps;
};

/**
 * Set the volume of the track
 *
 * @param {JQuery object} volume  The volume slider jquery object
 */
sequencer.prototype.setVolume = function (volume) {

    var self = this;

    volume.on('input', function(event) {

        // Get the volume value in decibles
        var db = parseInt(event.target.value);

        // Set the volume
        self.synth.volume.value = db;

        // Set the track volume
        self.track.volume = db;

        // Push changes of the track to the arrangement
        self.pushChanges();

    });
};

module.exports = sequencer;

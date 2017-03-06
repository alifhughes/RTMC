var Tone = require('tone');
var trigger = require('../../../helpers/trigger');
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
    this.steps = matrix;
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

    });
};

module.exports = sequencer;

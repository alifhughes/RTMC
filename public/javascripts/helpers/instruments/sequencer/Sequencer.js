var Tone = require('tone');
var trigger = require('../../../helpers/trigger');

// Initialise empty matrix
var steps;

//create a synth and connect it to the master output (your speakers)
var synth = new Tone.AMSynth().toMaster();

// 16n note
var duration = '16n';

// Set the bpm default bpm
Tone.Transport.bpm.value = 120;

// Sequence notes
var seq = new Tone.Sequence(function(time, col) {

    // Get the array of columns from the matrix
    var column = steps.matrix[col];

    if (1 === column[0]) {
        // Trigger synth to play note at the time passed in to the callback
        trigger(synth, "C4", '32n');
    }

}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], duration);

Tone.Transport.start();

/**
 * Constructor
 *
 * @returns{sequencer} instance of itself
 */
var sequencer = function () {
    return this;
};

/**
 * Start the loop sequence
 */
sequencer.start = function () {
    // Start the Transport timer
    seq.start();
};

/**
 * Stop the loop sequence
 */
sequencer.stop = function () {
    // Stop the transport timer
    seq.stop();
};

/**
 * Setter for bpm
 *
 * @param{int} bpm  The bpm for the loop
 */
sequencer.setBpm = function(bpm) {
   Tone.Transport.bpm.value = bpm;
};

/**
 * Set the matrix for the steps sequencer
 *
 * @param {DOM} matrix  The matrix DOM that is the steps of the sequencer
 */
sequencer.setMatrix = function (matrix) {
    steps = matrix;
};

/**
 * Set the volume of the track
 *
 * @param {JQuery object} volume  The volume slider jquery object
 */
sequencer.setVolume = function (volume) {

    volume.on('input', function(event) {

        // Get the volume value in decibles
        var db = parseInt(event.target.value);

        // Set the volume
        synth.volume.value = db;

    });
};

module.exports = sequencer;

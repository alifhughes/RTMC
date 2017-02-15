var Tone = require('tone');
var trigger = require('../../helpers/trigger');

//create a synth and connect it to the master output (your speakers)
var synth = new Tone.MetalSynth().toMaster();

// 16n note
var note = '16n';

// Continue loop
Tone.Transport.loop = true

// Set loop duration
Tone.Transport.loopEnd = '1m'

// Set the bpm
Tone.Transport.bpm.value = 120;

// Schedule a note to be played every 2 beats
Tone.Transport.schedule(function(time) {

    // Trigger synth to play note at the time passed in to the callback
    trigger(synth, note, time);
}, '2n');

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
    console.log('started');
    // Start the Transport timer
    Tone.Transport.start();
};

/**
 * Stop the loop sequence
 */
sequencer.stop = function () {
    console.log('stopped');
    // Stop the transport timer
    Tone.Transport.stop();
};

module.exports = sequencer;

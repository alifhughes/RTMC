var Tone = require('tone');
var sequencer = require('./helpers/sequencer/sequencer');
var $ = require('jquery');

// Bool flag to see if playing
var playing = false;

$('#play').on('click', function() {

    // Check if it is playing
    if (true === playing) {

        // Stop the sequencer
        sequencer.stop();

        // Set playing to false
        playing = false;
    } else {

        // Start the sequencer
        sequencer.start();

        // Set playing to true
        playing = true;
    }

});

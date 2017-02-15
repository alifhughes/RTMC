var sequencer = require('./helpers/sequencer/sequencer');
var $ = require('jquery');

// Get the intial value of the bpm slider
var bpm = $('#bpm').attr("value");

/**
 * Add event listener for the bpm slider
 */
$('#bpm').on('input', function(event) {

    // Get the bpm value
    bpm = parseInt(event.target.value);

    // Set the bpm value
    sequencer.setBpm(bpm);
});

$('#start').on('click', function() {

        // Start the sequencer
        sequencer.start();

});

$('#stop').on('click', function() {

        // Stop the sequencer
        sequencer.stop();

});

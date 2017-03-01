var sequencer = require('./helpers/instruments/sequencer/sequencer');
var instrumentFactory = require('./helpers/instruments/instrumentfactory');
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

/**
 * Event listener for starting the playback
 */
$('#start').on('click', function() {

    // Start the sequencer
    sequencer.start();

});

/**
 * Event listener for stopping the playback
 */
$('#stop').on('click', function() {

    // Stop the sequencer
    sequencer.stop();

});

/**
 * Event listener for adding an instrument
 */
$('#addInstrument').on('click', function () {

    // Get the selected instrument from the drop down
    var instrument = $('#instruments').val();

    // Create the instrument selected
    instrumentFactory.createInstrument(instrument).then(function(track) {

        // Append the newly created instrument track to the tracks
        $('#instrumentTracks').appendChild(track);

    });
});

var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');
var $ = require('jquery');
var Tone = require('tone');
var Sync = require('./helpers/sync');
var proxify = require('./helpers/proxify');
var NXLoader = require('./helpers/nxloader');

// Load the nexus ui
nxloader = new NXLoader();
nxloader.load();

// Connect to socket
var socket = io.connect('http://localhost:3000');

// Create new instance of sync
var sync = new Sync(socket);

// Array of sequences
var sequences = [];

// Get the intial value of the bpm slider
var bpm = $('#bpm').attr("value");

/**
 * Add event listener for the bpm slider
 */
$('#bpm').on('input', function(event) {

    // Get the bpm value
    bpm = parseInt(event.target.value);

    // Set the BPM value
    Tone.Transport.bpm.value = bpm;
});

/**
 * Event listener for starting the playback
 */
$('#start').on('click', function() {

    // Loop all the sequences
    sequences.forEach(function(sequence) {

        // Start the sequence
        sequence.start();

    });
});

/**
 * Event listener for stopping the playback
 */
$('#stop').on('click', function() {

    // Loop all the sequences
    sequences.forEach(function(sequence) {

        // Stop the sequence
        sequence.stop();

    });

});

/**
 * Event listener for adding an instrument
 */
$('#addInstrument').on('click', function () {

    // Get the selected instrument from the drop down
    var instrument = $('#instruments').val();

    var instrumentFactory = new InstrumentFactory();

    // Create the instrument selected
    instrumentFactory.createInstrument(instrument).then(function(instrumentContainer) {

        // Sync the instrument
        sync.addChange(instrumentContainer.html);

        // Push the sequence on to the sequences
        sequences.push(instrumentContainer.seq);

    });

});

var InstrumentFactory = require('./helpers/instruments/InstrumentFactory');
var $ = require('jquery');
var Tone = require('tone');

// Connect to socket
var socket = io.connect('http://localhost:3000');
socket.on('broadcast',function(data){
    console.log(data.description);
});

var observer = new MutationObserver(function(mutations) {
    // For the sake of...observation...let's output the mutation to console to see how this all works
    mutations.forEach(function(mutation) {
        console.log(mutation);
    });
});

// Notify me of everything!
var observerConfig = {
    attributes: true,
    childList: true,
    characterData: true
};

// Node, config
// In this case we'll listen to all changes to body and child nodes
var targetNode = document.body;
observer.observe(targetNode, observerConfig);
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
    instrumentFactory.createInstrument(instrument).then(function(sequence) {

        // Push the sequence on to the sequences
        sequences.push(sequence);
        console.log('sequence', sequence);

    });

});

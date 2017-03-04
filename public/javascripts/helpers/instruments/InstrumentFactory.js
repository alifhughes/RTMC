var generateSequencerElement = require('./sequencer/GenerateSequencerElement');
var sequencer = require('./sequencer/sequencer');

/**
 * Constructor
 *
 * returns {instrumentFactory}   Instance of itself
 */
var instrumentFactory = function () {
    return this;
};

/**
 * Factory for creating instrument's HTML and initialise the instrument object
 *
 * @param {string} instrument  The name of the instrument to be created
 * @returns {HTML}  instrumentTrack  The html of the instrument
 */
instrumentFactory.createInstrument = function (instrument) {

    // Switch on the instrument passed in
    switch (instrument) {

        // Create step sequencer
        case 'step-sequencer':

            // Create the html
            generateSequencerElement.generate.then(function (elements) {

                // Get the elements
                var matrix = elements.matrix;
                var volume = elements.volume;

                // Set the sequencer objects
                sequencer.setMatrix(matrix);
                sequencer.setVolume(volume);

            });

            break;

        default:

            // Throw error
            return new Error('No instrument passed into factory');
            break;

    };
};

module.exports = instrumentFactory;

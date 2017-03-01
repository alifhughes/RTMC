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
            return new Promise(function(resolve, reject) {
                generateSequencerElement.generate().then(function (elements) {

                    // Get the elements
                    var matrix = elements.matrix;
                    var volume = elements.volume;
                    var sequencerElement = elements.sequencer;

                    // Set the sequencer objects
                    sequencer.setMatrix(matrix);
                    sequencer.setVolume(volume);
                    resolve(sequenverElement);
                    console.log('sequenverElement', sequenverElement);
                });

            });

            break;

        default:

            // Throw error
            return new Error('No instrument passed into factory');
            break;

    };
};

module.exports = instrumentFactory;

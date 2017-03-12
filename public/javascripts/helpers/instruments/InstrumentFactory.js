var generateSequencerElement = require('./sequencer/GenerateSequencerElement');
var Sequencer = require('./sequencer/sequencer');

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
instrumentFactory.prototype.createInstrument = function (instrument) {

    // Switch on the instrument passed in
    switch (instrument) {

        // Create step sequencer
        case 'step-sequencer':

            // Create the html
            return new Promise(function(resolve, reject) {
                generateSequencerElement.generate(function (elements) {

                    // Get the elements
                    var matrix = elements.matrix;
                    var volume = elements.volume;

                    var seq = new Sequencer();

                    // Set the sequencer objects
                    seq.setMatrix(matrix);
                    seq.setVolume(volume);

                    // Create a return object containing sequencer instance
                    // and the raw html to sync with other clients
                    var instrumentContainer = {};
                   instrumentContainer.seq = seq;
                    instrumentContainer.html = elements.html;
                    resolve(instrumentContainer);

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

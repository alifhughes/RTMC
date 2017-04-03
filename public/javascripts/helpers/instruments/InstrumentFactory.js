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
 * @param {string}      instrument       The name of the instrument to be created
 * @param {string|bool} id               The guid of the instrument if it is already created
 * @returns {HTML}      instrumentTrack  The html of the instrument
 */
instrumentFactory.prototype.createInstrument = function (instrument, id) {

    // Switch on the instrument passed in
    switch (instrument) {

        // Create step sequencer
        case 'step-sequencer':

            // Create the html
            return new Promise(function(resolve, reject) {
                generateSequencerElement.generate(id, function (elements) {

                    // Get the elements
                    var matrix  = elements.matrix;
                    var volume  = elements.volume;
                    var trackId = elements.id;

                    // Init new sequencer object with id
                    var seq = new Sequencer(trackId);

                    // Set the sequencer objects
                    seq.setMatrix(matrix);
                    seq.setVolume(volume);

                    // Create a return object containing sequencer instance
                    var instrumentContainer  = {};
                    instrumentContainer.seq  = seq;
                    instrumentContainer.id   = trackId;
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

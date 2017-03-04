var $ = require('jquery');

/**
 * Constructor
 *
 * @returns {generateSequencerElement} instance of itself
 */
var generateSequencerElement = function () {
    return this;
};

/**
 * Create promise that loads and creates the instrument
 */
var generateStepSequencer =  new Promise(function (resolve, reject) {

        // Create the instrument container row div
        var instrumentContainer = document.createElement("div");
        instrumentContainer.className = 'row instrument-container';

        // Create the sample container column div
        var sampleContainer = document.createElement("div");
        sampleContainer.className = 'col-md-2 light-grey-background-colour sample-container';

        // Create the steps container column div
        var stepsContainer = document.createElement("div");
        stepsContainer.className = 'col-md-9 step-sequencer-container light-grey-background-colour';

        // Create volume range for sequencer
        var volume = document.createElement("input");
        volume.setAttribute('type', 'range');
        volume.setAttribute('value', 0);
        volume.setAttribute('name', 'volume');
        volume.setAttribute('min', -12);
        volume.setAttribute('max', 12);

        // Create matrix canvas for the nx ui element
        var matrix = document.createElement("canvas");
        matrix.setAttribute('nx', 'matrix');

        // Build the entire rack
        instrumentContainer.appendChild(sampleContainer);
        instrumentContainer.appendChild(stepsContainer);
        sampleContainer.appendChild(volume);
        stepsContainer.appendChild(matrix);
        $('#instrumentTracks').append(instrumentContainer);

        // Load the matrix
        nx.onload = function () {

            // Init empty object to contain the elements
            var elements = {};

            // Colours
            nx.colorize("accent", "#ffbb4c");
            nx.colorize("fill", "#1D2632");

            // Specified size
            matrix1.col = 16;
            matrix1.row = 1;
            matrix1.init();
            matrix1.resize($('.step-sequencer-container').width(), $('.step-sequencer-container').height());

            // Set the element
            elements.matrix = matrix1;
            elements.volume = $(volume);

            // Send the elements back
            resolve(elements);

        };
});

module.exports.generate = generateStepSequencer;

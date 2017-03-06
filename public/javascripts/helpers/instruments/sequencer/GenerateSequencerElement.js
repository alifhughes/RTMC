var $ = require('jquery');

/**
 * Constructor
 *
 * @returns {generateSequencerElement} instance of itself
 */
var generateSequencerElement = function () {
    return this;
};

generateSequencerElement.generate = function (callback) {

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

        // Build the entire rack
        instrumentContainer.appendChild(sampleContainer);
        instrumentContainer.appendChild(stepsContainer);
        sampleContainer.appendChild(volume);
        $('#instrumentTracks').append(instrumentContainer);

        // Add the matrix
        nx.add("matrix", {w: $('.step-sequencer-container').width(), h:  $('.step-sequencer-container').height(), parent: stepsContainer});

        // Colours
        nx.colorize("accent", "#ffbb4c");
        nx.colorize("fill", "#1D2632");

        // Get the latest element added on
        // CHANGE THIS FUNCTIONALITY - WILL CAUSE BUGS
        var matrix = nx.widgets[Object.keys(nx.widgets)[Object.keys(nx.widgets).length - 1]];

        // Set the properties of the matrix
        matrix.col = 16;
        matrix.row = 1;
        matrix.init();

        // Init empty elements object
        var elements = {};

        // Set the element
        elements.matrix = matrix;
        elements.volume = $(volume);

        // Send the elements back
        callback(elements);

};

module.exports = generateSequencerElement;

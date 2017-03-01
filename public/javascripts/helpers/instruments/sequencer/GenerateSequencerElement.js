var $ = require('jquery');

/**
 * Constructor
 *
 * @returns {generateSequencerElement} instance of itself
 */
var generateSequencerElement = function () {
    return this;
};

generateSequencerElement.generate = function () {
    // Return a promise with the resolve containing the loaded elements
    return new Promise(function (resolve, reject) {

            // Load the matrix
            nx.onload = function () {

                // Init empty object to contain the elements
                var elements = {};

                // Colours
                nx.colorize("accent", "#ffbb4c");
                nx.colorize("fill", "#1D2632");

                // Create the instrument container row div
                var instrumentContainer = document.createElement("div");
                instrumentContainer.className = 'row instrument-container';

                // Create the sample container column div
                var sampleContainer = document.createElement("div");
                sampleContainer.className = 'col-md-2 light-grey-background-colour sample-container';

                // Create the steps container column div
                var stepsContainer = document.createElement("div");
                stepsContainer.className = 'col-md-9 step-sequencer-container';

                // Specified size
                matrix1.col = 16;
                matrix1.row = 1;
                matrix1.init();
                matrix1.resize($(stepsContainer).width(), $(stepsContainer).height());
                console.log('matrix1', matrix1);

                // Create volume range for sequencer
                var volume = document.createElement("input");
                volume.setAttribute('type', 'range');
                volume.setAttribute('value', 0);
                volume.setAttribute('name', 'volume');
                volume.setAttribute('min', -12);
                volume.setAttribute('max', 12);

                // Create the whole DOM object
                sampleContainer.appendChild(volume);
                stepsContainer.appendChild(matrix1);
                instrumentContainer.appendChild(sampleContainer);
                instrumentContainer.appendChild(stepsContainer);

                // Set the element
                elements.matrix = matrix1;
                elements.volume = $(volume);
                elements.sequencer = instrumentContainer;

                // Send the elements back
                resolve(elements);

            };
        }
    );
};

module.exports = generateSequencerElement;

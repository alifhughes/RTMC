var $ = require('jquery');

/**
 * Constructor
 *
 * @returns {nxloader} instance of itself
 */
var nxloader = function () {
    return this;
};

// Promise so that elements are assigned when ready
function sequencerLoader() {

    return new Promise(function (resolve, reject) {

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
                matrix1.resize($(".step-sequencer-container").width(), $(".step-sequencer-container").height());

                // Create volume range for sequencer
                var volume = document.createElement("input");
                volume.setAttribute('type', 'range');
                volume.setAttribute('value', 0);
                volume.setAttribute('name', 'volume');
                volume.setAttribute('min', -12);
                volume.setAttribute('max', 12);
                document.getElementsByClassName('sample-container')[0].appendChild(volume);

                // Set the element
                elements.matrix = matrix1;
                elements.volume = $(volume);

                // Send the elements back
                resolve(elements);

            };
        }
    );
};

/**
 * Loads the instrument passed in
 *
 * @param {string} instrument The instrument type to load
 */
nxloader.load = function (instrument) {

    // Switch on the element passed in on which to create
    switch (instrument) {
        case 'sequencer':

            // Return the promise of the matrix
            return sequencerLoader();

        default:

            // Throw error
            return new Error('No instrument passed into loader');
            break;

    };

    // Implement fluent interface
    return this;

};

module.exports = nxloader;

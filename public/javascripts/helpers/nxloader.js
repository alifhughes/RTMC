var $ = require('jquery');

/**
 * Variable to hold the element that is loaded.
 */
var element = false;

/**
 * Constructor
 *
 * @returns {nxloader} instance of itself
 */
var nxloader = function () {
    return this;
};

// Promise so that matrix is assigned when ready
function matrixLoader() {

    return new Promise(function (resolve, reject) {

            // Load the matrix
            nx.onload = function () {
                // Colours
                nx.colorize("accent", "#ffbb4c");
                nx.colorize("fill", "#1D2632");

                // Specified size
                matrix1.col = 16;
                matrix1.row = 1;
                matrix1.init();
                matrix1.resize($(".step-sequencer-container").width(), $(".step-sequencer-container").height());

                // Set the element
                matrix1;

                // Send matrix back
                resolve(matrix1);

            };
        }
    );
};


/**
 * Loads the element passed in
 *
 * @param {string} element  The element type to load
 */
nxloader.load = function (element) {

    // Switch on the element passed in on which to create
    switch (element) {
        case 'matrix':

            // Return the promise of the matrix
            return matrixLoader();

        default:

            // Throw error
            return new Error('No element passed into loader');
            break;

    };

    // Implement fluent interface
    return this;

};

nxloader.getElement = function () {
    return element;
}

function setElement (elementToSet) {
    element = elementToSet;
};

module.exports = nxloader;

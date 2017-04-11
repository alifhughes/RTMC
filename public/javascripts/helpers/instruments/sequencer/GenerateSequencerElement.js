var $ = require('jquery');
var guid = require('../../../helpers/idgenerator');

/**
 * Constructor
 *
 * @returns {generateSequencerElement} instance of itself
 */
var generateSequencerElement = function () {
    return this;
};

generateSequencerElement.generate = function (id, callback) {

        // Check if guid has been set
        if (id == false) {
            // Guid hasn't been set, create one
            id = guid();
        }

        // Create the instrument container row div
        var instrumentContainer = document.createElement("div");
        instrumentContainer.className = 'row instrument-container';
        instrumentContainer.setAttribute('id', id);

        // Create the sample container column div
        var sampleContainer = document.createElement("div");
        sampleContainer.className = 'col-md-2 light-grey-background-colour sample-container';

        // Create the steps container column div
        var stepsContainer = document.createElement("div");
        stepsContainer.className = 'col-md-9 step-sequencer-container';

        // Create volume range for sequencer
        var volume = document.createElement("input");
        volume.setAttribute('type', 'range');
        volume.setAttribute('value', 0);
        volume.setAttribute('name', 'volume');
        volume.setAttribute('min', -12);
        volume.setAttribute('max', 12);

        // Create a container div removing/clearing track actions
        var trackRemoveActionsContainer = document.createElement("div");
        trackRemoveActionsContainer.className = 'col-md-1 track-remove-actions-container';

        // Create the remove track icon
        var removeTrackIcon = document.createElement("i");
        removeTrackIcon.className = 'delete-track fa fa-trash fa-3x';
        removeTrackIcon.setAttribute('track-id', id);

        // Build the entire rack
        instrumentContainer.appendChild(sampleContainer);
        instrumentContainer.appendChild(stepsContainer);
        instrumentContainer.appendChild(trackRemoveActionsContainer);
        trackRemoveActionsContainer.appendChild(removeTrackIcon);
        sampleContainer.appendChild(volume);
        $('#instrumentTracks').append(instrumentContainer);

        // Add the matrix
        nx.add("matrix", {w: $('.step-sequencer-container').width(), h:  $('.step-sequencer-container').height(), parent: stepsContainer});

        // Get the latest element added on
        // BE WEARY OF THIS FUNCTIONALITY
        var matrix = nx.widgets[Object.keys(nx.widgets)[Object.keys(nx.widgets).length - 1]];

        // Set the properties of the matrix
        matrix.col = 16;
        matrix.row = 1;
        matrix.init();

        // Init empty elements object
        var elements = {};

        // Create the raw html of the instrument container and its children
        var html = instrumentContainer.outerHTML;

        // Set the element
        elements.matrix = matrix;
        elements.volume = $(volume);
        elements.html = html;
        elements.id   = id;

        // Send the elements back
        callback(elements);

};

module.exports = generateSequencerElement;

var $ = require('jquery');
var guid = require('../../../helpers/idgenerator');
var samplesObject = require('../../../helpers/samplelist');

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
        volume.className = 'volume-slider';
        volume.setAttribute('type', 'range');
        volume.setAttribute('value', 0);
        volume.setAttribute('name', 'volume');
        volume.setAttribute('min', -12);
        volume.setAttribute('max', 12);

        // Create settings button icon
        var settingsIcon = document.createElement("i");
        settingsIcon.className = "track-settings fa fa-cog fa-2x";
        settingsIcon.setAttribute('aria-hidden', 'true');

        // Create settings popup
        var settingsPopup = document.createElement("div");
        settingsPopup.className = "track-settings-popup light-grey-background-colour";
        $(settingsPopup).hide();

        // Create contents of popup
        var settingsPopupContainerDiv = document.createElement("div");

        // Create Title of popup
        var settingsPopupTitle = document.createElement("h3");
        settingsPopupTitle.innerHTML = "Sequencer Settings";
        settingsPopupTitle.className = "settings-popup-title centre-text";

        // Content of popup
        var settingsPopupRow = document.createElement("div");
        settingsPopupRow.className = "settings-popup-row";

        var settingsPopupLableSamples = document.createElement("h4");
        settingsPopupLableSamples.innerHTML = "Samples:";

        //Create and append select list
        var samplesList = document.createElement("select");

        //Create and append the options
        for (var sample in samplesObject) {

            // Check if property is available
            if(samplesObject.hasOwnProperty(sample)) {

                // Create the option
                var option = document.createElement("option");
                option.value = samplesObject[sample];
                option.text  = sample;

                // Append it to the list
                samplesList.appendChild(option);
            }
        };

        // Create popup confirm and exit buttons
        var settingsPopupConfirmBtn = document.createElement("button");
        settingsPopupConfirmBtn.innerHTML = "Confirm";
        var settingsPopupCancelBtn = document.createElement("button");
        settingsPopupCancelBtn.innerHTML = "Cancel";

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
        instrumentContainer.appendChild(settingsPopup);

        settingsPopup.appendChild(settingsPopupContainerDiv);
        settingsPopupContainerDiv.appendChild(settingsPopupTitle);
        settingsPopupContainerDiv.appendChild(settingsPopupRow);
        settingsPopupRow.appendChild(settingsPopupLableSamples);
        settingsPopupRow.appendChild(samplesList);
        var secondRow = settingsPopupRow.cloneNode(true);
        secondRow.innerHTML = "";
        secondRow.appendChild(settingsPopupConfirmBtn);
        secondRow.appendChild(settingsPopupCancelBtn);
        settingsPopupContainerDiv.appendChild(secondRow);

        trackRemoveActionsContainer.appendChild(removeTrackIcon);

        sampleContainer.appendChild(volume);
        sampleContainer.appendChild(settingsIcon);

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

        // Create the settings popup object
        var settingsPopupElements = {};
        settingsPopupElements.confirmBtn = $(settingsPopupConfirmBtn);
        settingsPopupElements.cancelBtn = $(settingsPopupCancelBtn);
        settingsPopupElements.icon  = $(settingsIcon);
        settingsPopupElements.popup = $(settingsPopup);
        settingsPopupElements.samplesList = $(samplesList);


        // Set the element
        elements.matrix   = matrix;
        elements.volume   = $(volume);
        elements.html     = html;
        elements.id       = id;
        elements.settings = settingsPopupElements;

        // Send the elements back
        callback(elements);

};

module.exports = generateSequencerElement;

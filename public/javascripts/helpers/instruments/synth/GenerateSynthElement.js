var $ = require('jquery');
var guid = require('../../../helpers/idgenerator');

/**
 * Constructor
 *
 * @returns {generateSynthElement} instance of itself
 */
var generateSynthElement = function () {
    return this;
};

generateSynthElement.generate = function (id, callback) {

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

        // Create mute icons
        var muteIcon = document.createElement("i");
        muteIcon.className = "track-mute fa fa-volume-off fa-2x";
        muteIcon.setAttribute('aria-hidden', 'true');

        var muteIconCross = document.createElement("i");
        muteIconCross.className = "track-mute-cross fa fa-times fa-1x";
        muteIconCross.setAttribute('aria-hidden', 'true');

        var muteIconsDiv = document.createElement("div");
        muteIconsDiv.className = "track-mute-container";

        // Create settings popup
        var settingsPopup = document.createElement("div");
        settingsPopup.className = "track-settings-popup light-grey-background-colour";
        $(settingsPopup).hide();

        // Create contents of popup
        var settingsPopupContainerDiv = document.createElement("div");
        settingsPopupContainerDiv.className = 'settings-popup-container';

        // Create Title of popup
        var settingsPopupTitle = document.createElement("h3");
        settingsPopupTitle.innerHTML = "Synth Settings";
        settingsPopupTitle.className = "settings-popup-title centre-text";

        // Content of popup
        var settingsPopupRow = document.createElement("div");
        settingsPopupRow.className = "settings-popup-row";

        // Create popup confirm and exit buttons
        var settingsPopupConfirmBtn = document.createElement("button");
        settingsPopupConfirmBtn.innerHTML = "Confirm";
        settingsPopupConfirmBtn.className = "btn btn-default";
        var settingsPopupCancelBtn = document.createElement("button");
        settingsPopupCancelBtn.innerHTML = "Cancel";
        settingsPopupCancelBtn.className = "btn btn-default";

        var settingsPopupCancelBtn = document.createElement("button");
        settingsPopupCancelBtn.innerHTML = "Cancel";
        settingsPopupCancelBtn.className = "btn btn-default";

        var settingsPopupRecordBtn = document.createElement("button");
        settingsPopupRecordBtn.innerHTML = "Record";
        settingsPopupRecordBtn.className = "btn btn-error";

        var settingsPopupClearBtn = document.createElement("button");
        settingsPopupClearBtn.innerHTML = "Clear recording";
        settingsPopupClearBtn.className = "btn btn-default";

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

        var recordingButtonRow = settingsPopupRow.cloneNode(true);
        recordingButtonRow.innerHTML = "";
        recordingButtonRow.appendChild(settingsPopupRecordBtn);
        recordingButtonRow.appendChild(settingsPopupClearBtn);
        settingsPopupContainerDiv.appendChild(recordingButtonRow);


        var buttonRow = settingsPopupRow.cloneNode(true);
        buttonRow.innerHTML = "";
        buttonRow.appendChild(settingsPopupConfirmBtn);
        buttonRow.appendChild(settingsPopupCancelBtn);
        settingsPopupContainerDiv.appendChild(buttonRow);

        trackRemoveActionsContainer.appendChild(removeTrackIcon);

        sampleContainer.appendChild(volume);
        sampleContainer.appendChild(settingsIcon);

        muteIconsDiv.appendChild(muteIcon);
        muteIconsDiv.appendChild(muteIconCross);

        sampleContainer.appendChild(muteIconsDiv);

        $('#instrumentTracks').append(instrumentContainer);

        // Add the keyboard
        nx.add("keyboard", {w: $('.step-sequencer-container').width(), h:  $('.step-sequencer-container').height(), parent: stepsContainer});

        // Get the latest element added on
        // BE WEARY OF THIS FUNCTIONALITY
        var keyboard = nx.widgets[Object.keys(nx.widgets)[Object.keys(nx.widgets).length - 1]];

        //This key pattern would put a black key between every white key
        keyboard.octaves = 5;
        keyboard.colors.fill = "#1D2632";
        keyboard.colors.black = "#FFBB4C";
        keyboard.init();

        // Init empty elements object
        var elements = {};

        // Create the raw html of the instrument container and its children
        var html = instrumentContainer.outerHTML;

        // Create the settings popup object
        var settingsPopupElements = {};
        settingsPopupElements.recordBtn = $(settingsPopupRecordBtn);
        settingsPopupElements.clearBtn = $(settingsPopupClearBtn);
        settingsPopupElements.confirmBtn = $(settingsPopupConfirmBtn);
        settingsPopupElements.cancelBtn = $(settingsPopupCancelBtn);
        settingsPopupElements.icon  = $(settingsIcon);
        settingsPopupElements.popup = $(settingsPopup);

        // Set the element
        elements.volume   = $(volume);
        elements.mute     = $(muteIconsDiv);
        elements.id       = id;
        elements.settings = settingsPopupElements;
        elements.keyboard = keyboard;

        // Send the elements back
        callback(elements);

};

module.exports = generateSynthElement;

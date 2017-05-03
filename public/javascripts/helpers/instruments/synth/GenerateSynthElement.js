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
        volume.setAttribute('name', 'volume');
        volume.setAttribute('min', 0);
        volume.setAttribute('max', 0.5);
        volume.setAttribute('step', 0.01);
        volume.setAttribute('value', 0.2);

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
        settingsPopup.className = "track-settings-popup-synth light-grey-background-colour";
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

        var settingsPopupRecordBtn = document.createElement("button");
        settingsPopupRecordBtn.innerHTML = "Record";
        settingsPopupRecordBtn.className = "btn btn-danger";

        var settingsPopupClearBtn = document.createElement("button");
        settingsPopupClearBtn.innerHTML = "Clear recording";
        settingsPopupClearBtn.className = "btn btn-default";

        // Create a container div removing/clearing track actions
        var trackRemoveActionsContainer = document.createElement("div");
        trackRemoveActionsContainer.className = 'col-md-1 track-remove-actions-container-synth';

        // Create the remove track icon
        var removeTrackIcon = document.createElement("i");
        removeTrackIcon.className = 'delete-track fa fa-trash fa-3x';
        removeTrackIcon.setAttribute('track-id', id);

        var trackSelectedCheckboxBtn = document.createElement("input");
        trackSelectedCheckboxBtn.setAttribute("type", "checkbox");
        trackSelectedCheckboxBtn.className = 'track-selected-checkbox-btn';

        //Create and append select list for osc type
        var oscTypeSelect = document.createElement("select");
        oscTypeSelect.className = 'float-left';

        // Create osc option type object
        var oscTypesObj = {
            'Sawtooth': 'sawtooth',
            'Sinewave': 'sine',
            'Triangle': 'triangle',
            'Squarewave': 'square'
        };

        //Create and append the options
        for (var oscType in oscTypesObj) {

            // Check if property is available
            if(oscTypesObj.hasOwnProperty(oscType)) {

                // Create the option
                var option = document.createElement("option");
                option.value = oscTypesObj[oscType];
                option.text  = oscType;

                // Append it to the list
                oscTypeSelect.appendChild(option);
            }
        };

        // Clone the select
        var osc1TypeSelect = oscTypeSelect.cloneNode(true);
        var osc2TypeSelect = oscTypeSelect.cloneNode(true);

        //Create and append select list for osc detune
        var oscDetuneSelect = document.createElement("select");
        oscDetuneSelect.className = 'float-left';

        //Create and append the options
        for (var i = -10; i <= 10; i++) {

            // Create the option
            var option = document.createElement("option");
            option.value = i;
            option.text  = i;

            // Append it to the list
            oscDetuneSelect.appendChild(option);
        }

        // Clone the select
        var osc1DetuneSelect = oscDetuneSelect.cloneNode(true);
        var osc2DetuneSelect = oscDetuneSelect.cloneNode(true);

        // Build osc edit 1
        var osc1EditContainerDiv = document.createElement('div');
        osc1EditContainerDiv.className = 'osc-edit-container';

        // Create Label
        osc1EditTitleLabel = document.createElement('h5');
        osc1EditTitleLabel.innerHTML = 'Oscillator 1:'

        // The label type
        osc1TypeLabel = document.createElement('h5');
        osc1TypeLabel.innerHTML = 'Type: ';
        osc1TypeLabel.className = 'float-left';

        // The label detune
        osc1DetuneLabel = document.createElement('h5');
        osc1DetuneLabel.innerHTML = 'Detune: ';
        osc1DetuneLabel.className = 'float-left';

        // The label attack
        oscAttackLabel = document.createElement('h5');
        oscAttackLabel.innerHTML = 'Attack: ';

        // The label release
        oscReleaseLabel = document.createElement('h5');
        oscReleaseLabel.innerHTML = 'Release: ';

        // Create volume range for sequencer
        var attack = document.createElement("input");
        attack.className = 'volume-slider';
        attack.setAttribute('type', 'range');
        attack.setAttribute('value', 0);
        attack.setAttribute('name', 'volume');
        attack.setAttribute('min', 0);
        attack.setAttribute('max', 4);
        attack.setAttribute('step', 0.2);

        // Create volume range for sequencer
        var release = document.createElement("input");
        release.className = 'volume-slider';
        release.setAttribute('type', 'range');
        release.setAttribute('value', 0);
        release.setAttribute('name', 'volume');
        release.setAttribute('min', 0);
        release.setAttribute('max', 4);
        release.setAttribute('step', 0.2);

        // Clone the nodes for each osc
        var osc1AttackLabel = oscAttackLabel.cloneNode(true);
        var osc2AttackLabel = oscAttackLabel.cloneNode(true);
        var osc1ReleaseLabel = oscReleaseLabel.cloneNode(true);
        var osc2ReleaseLabel = oscReleaseLabel.cloneNode(true);
        var osc1AttackSlider = attack.cloneNode(true);
        var osc2AttackSlider = attack.cloneNode(true);
        var osc1ReleaseSlider  = release.cloneNode(true);
        var osc2ReleaseSlider  = release.cloneNode(true);

        // Create osc 1
        osc1EditContainerDiv.appendChild(osc1EditTitleLabel);
        osc1EditContainerDiv.appendChild(osc1TypeLabel);
        osc1EditContainerDiv.appendChild(osc1TypeSelect);
        osc1EditContainerDiv.appendChild(osc1DetuneLabel);
        osc1EditContainerDiv.appendChild(osc1DetuneSelect);
        osc1EditContainerDiv.appendChild(osc1AttackLabel);
        osc1EditContainerDiv.appendChild(osc1AttackSlider);
        osc1EditContainerDiv.appendChild(osc1ReleaseLabel);
        osc1EditContainerDiv.appendChild(osc1ReleaseSlider);

        // Build osc edit 2
        var osc2EditContainerDiv = document.createElement('div');
        osc2EditContainerDiv.className = 'osc-edit-container';

        // Create Label
        osc2EditTitleLabel = document.createElement('h5');
        osc2EditTitleLabel.innerHTML = 'Oscillator 2:'

        // The label type
        osc2TypeLabel = document.createElement('h5');
        osc2TypeLabel.innerHTML = 'Type: ';
        osc2TypeLabel.className = 'float-left';

        // The label detune
        osc2DetuneLabel = document.createElement('h5');
        osc2DetuneLabel.innerHTML = 'Detune: ';
        osc2DetuneLabel.className = 'float-left';

        // Create osc 2
        osc2EditContainerDiv.appendChild(osc2EditTitleLabel);
        osc2EditContainerDiv.appendChild(osc2TypeLabel);
        osc2EditContainerDiv.appendChild(osc2TypeSelect);
        osc2EditContainerDiv.appendChild(osc2DetuneLabel);
        osc2EditContainerDiv.appendChild(osc2DetuneSelect);
        osc2EditContainerDiv.appendChild(osc2AttackLabel);
        osc2EditContainerDiv.appendChild(osc2AttackSlider);
        osc2EditContainerDiv.appendChild(osc2ReleaseLabel);
        osc2EditContainerDiv.appendChild(osc2ReleaseSlider);

        // Create wrapper for osc edits
        var oscEditWrapper = document.createElement("div");
        oscEditWrapper.className = 'osc-edit-wrapper';

        // Build the entire rack
        instrumentContainer.appendChild(sampleContainer);
        instrumentContainer.appendChild(stepsContainer);
        instrumentContainer.appendChild(trackRemoveActionsContainer);
        instrumentContainer.appendChild(settingsPopup);

        settingsPopup.appendChild(settingsPopupContainerDiv);
        settingsPopupContainerDiv.appendChild(settingsPopupTitle);
        settingsPopupContainerDiv.appendChild(settingsPopupRow);

        var osc1SettingsRow = settingsPopupRow.cloneNode(true);
        osc1SettingsRow.innerHTML = "";
        osc1SettingsRow.className = "osc-edit-row";
        osc1SettingsRow.appendChild(osc1EditContainerDiv);

        var osc2SettingsRow = settingsPopupRow.cloneNode(true);
        osc2SettingsRow.innerHTML = "";
        osc2SettingsRow.className = "osc-edit-row";
        osc2SettingsRow.appendChild(osc2EditContainerDiv);


        oscEditWrapper.appendChild(osc1SettingsRow);
        oscEditWrapper.appendChild(osc2SettingsRow);

        settingsPopupContainerDiv.appendChild(oscEditWrapper);

        var waveformRow = settingsPopupRow.cloneNode(true);
        waveformRow.innerHTML = "";
        waveformRow.className = "waveform-row";
        var waveformLabel = document.createElement("h5");
        waveformLabel.innerHTML = "Waveform selector: (Waveform will appear once recorded)";
        settingsPopupContainerDiv.appendChild(waveformRow);
        waveformRow.appendChild(waveformLabel);

        settingsPopupContainerDiv.appendChild(waveformRow);

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
        trackRemoveActionsContainer.appendChild(trackSelectedCheckboxBtn);

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
        settingsPopupElements.osc1TypeSelect = $(osc1TypeSelect);
        settingsPopupElements.osc2TypeSelect = $(osc2TypeSelect);
        settingsPopupElements.osc1DetuneSelect = $(osc1DetuneSelect);
        settingsPopupElements.osc2DetuneSelect = $(osc2DetuneSelect);
        settingsPopupElements.osc1AttackSlider = $(osc1AttackSlider);
        settingsPopupElements.osc2AttackSlider = $(osc2AttackSlider);
        settingsPopupElements.osc1ReleaseSlider = $(osc1ReleaseSlider);
        settingsPopupElements.osc2ReleaseSlider = $(osc2ReleaseSlider);
        settingsPopupElements.waveformRow = waveformRow;


        // Set the element
        elements.volume   = $(volume);
        elements.mute     = $(muteIconsDiv);
        elements.id       = id;
        elements.settings = settingsPopupElements;
        elements.keyboard = keyboard;
        elements.trackSelectedCheckboxBtn = $(trackSelectedCheckboxBtn);

        // Send the elements back
        callback(elements);

};

module.exports = generateSynthElement;

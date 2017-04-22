var Tone = require('tone');
var deepClone = require('../../../helpers/deepclone');
var arrangement = require('../../../model/arrangement');
var trigger = require('../../../helpers/trigger');

// Start the tone timer
Tone.Transport.start();

/**
 * Constructor
 *
 * @param {string|bool} id  If track already exists from client or initalise
 *                          use the id to create it
 * @return {Synth}      Instance of itself
 */
function Synth (id) {

    // Init local guid
    this.id = id;

    // Set initialised flag
    this.isInitialised = false;

    // Initialse volume DOM element as false
    this.volumeDOM = false;

    // The keyboard ui object
    this.keyboard = false;

    /**
     * Track struct
     * {
     *    id: 'id',
     *    type: 'synth',
     *    volume: 60,
     *    pattern: this.steps.matrix
     * }
     */
    this.createTrackJSON = function () {

        // JSON object container meta data of track
        var track = {
            id: this.id,
            type: 'synth',
            volume: 0
        };

        return track;
    };

    // Init JSON struct of the track
    this.track = this.createTrackJSON();

    // Add the track to the arrangement
    arrangement.addTrack(deepClone(this.track));

    /**
     * Push track changes to the arrangement
     */
    this.pushChanges = function () {

        // replace the track in the arrangement with updated track
        arrangement.replaceTrack(deepClone(this.track));

    };

    var self = this;

    // Object to hold midi info
    this.midi = false;

    // Create audio context
    this.context = new AudioContext();
    this.oscillators = {};

    this.chunks = [];

    this.recordDestination = this.context.createMediaStreamDestination();
    this.mediaRecorder = new MediaRecorder(this.recordDestination.stream);

    this.mediaRecorder.ondataavailable = function(evt) {
        // push each chunk (blobs) in an array
        self.chunks.push(evt.data);
    };

    this.mediaRecorder.onstop = function(evt) {
        // Make blob out of our blobs, and open it.
        var blob = new Blob(self.chunks, { 'type' : 'audio/ogg; codecs=opus' });
        var ai = document.createElement("audio");
        ai.src = URL.createObjectURL(blob);
        document.getElementById(self.id).appendChild(ai);
    };

    /**
     * The handler for the incoming MIDI messages
     *
     * @param {object} message  The MIDI message
     */
    this.onMIDIMessage = function (message) {

        // This gives us our [command/channel, note, velocity] data
        var data = message.data;

console.log('MIDI data', data); // MIDI data [144, 63, 73]

        // Extract the info from the data
        var cmd = data[0] >> 4;
        var channel = data[0] & 0xf;
        var type = data[0] & 0xf0;
        var note = data[1];
        var velocity = data[2];
        var frequency = self.midiNoteToFrequency(message.data[1]);
        // with pressure and tilt off
        // note off: 128, cmd: 8 
        // note on: 144, cmd: 9
        // pressure / tilt on
        // pressure: 176, cmd 11: 
        // bend: 224, cmd: 14
        // log('MIDI data', data);

        // Handle the type of message
        switch(type){
            case 144: // noteOn message 
                self.noteOn(frequency, velocity, note);
                break;
            case 128: // noteOff message 
                self.noteOff(frequency, velocity, note);
                break;
        }

        console.log('data', data, 'cmd', cmd, 'channel', channel);
        self.logger('', 'key data', data);

    }
    /**
     * Utility function to conver midi note to frequency
     *
     * @param  {int} note  The midi note
     * @return {int}       The frequency of the note
     */
    self.midiNoteToFrequency = function (note) {
        return Math.pow(2, ((note - 69) / 12)) * 440;
    }

    /**
     * Log the info
     *
     */
    this.logger = function (container, label, data){
        console.log(label + " [channel: " + (data[0] & 0xf) + ", cmd: " + (data[0] >> 4) + ", type: " + (data[0] & 0xf0) + " , note: " + data[1] + " , velocity: " + data[2] + "]");
        //container.textContent = messages;
    }

    /**
     * On success message for connecting MIDI
     *
     * @param {object} midiAccess  The access object to midi
     */
    this.onMIDISuccess = function (midiAccess) {

console.log('MIDI Access Object', midiAccess);

        // this is our raw MIDI data, inputs, outputs, and sysex status
        self.midi = midiAccess;

        // Get the inputs
        var inputs = self.midi.inputs.values();

        // Loop over all available inputs and listen for any MIDI input
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            // Each time there is a midi message call the onMIDIMessage function
            input.value.onmidimessage = self.onMIDIMessage;
            self.listInputs(input);
        }

        // listen for connect/disconnect message
        self.midi.onstatechange = self.onStateChange;

        // Show ports
        self.showMIDIPorts(self.midi);
    }

    /**
     * Recongises state change/disconnect
     */
    this.onStateChange = function (message){
        self.showMIDIPorts(self.midi);
        var port = message.port, state = port.state, name = port.name, type = port.type;
        if(type == "input")
            console.log("name", name, "port", port, "state", state);

    }

    /**
     * List the inputs
     *
     * @param {object} inputs  The input info
     */
    this.listInputs = function (inputs){
        var input = inputs.value;
        console.log("Input port : [ type:'" + input.type + "' id: '" + input.id +
            "' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
            "' version: '" + input.version + "']");
    }

    /**
     * Display the information about the MIDI port to the user
     *
     * @param {object} midiAccess  The access object to the MIDI
     */
    this.showMIDIPorts = function (midiAccess){
        /*
        var inputs = midiAccess.inputs,
            outputs = midiAccess.outputs, 
            html;
        html = '<h4>MIDI Inputs:</h4><div class="info">';
        inputs.forEach(function(port){
            html += '<p>' + port.name + '<p>';
            html += '<p class="small">connection: ' + port.connection + '</p>';
            html += '<p class="small">state: ' + port.state + '</p>';
            html += '<p class="small">manufacturer: ' + port.manufacturer + '</p>';
            if(port.version){
                    html += '<p class="small">version: ' + port.version + '</p>';
            }
        });
        deviceInfoInputs.innerHTML = html + '</div>';

        html = '<h4>MIDI Outputs:</h4><div class="info">';
        outputs.forEach(function(port){
            html += '<p>' + port.name + '<br>';
            html += '<p class="small">manufacturer: ' + port.manufacturer + '</p>';
            if(port.version){
                    html += '<p class="small">version: ' + port.version + '</p>';
            }
        });
        deviceInfoOutputs.innerHTML = html + '</div>';
        */
    }

    /**
     * On failure for MIDI
     *
     * @param {error} e  The error for not connecting
     */
    this.onMIDIFailure = function (e) {
        // when we get a failed response, run this code
        console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    }

    /**
     * Note is being pressed
     */
    this.noteOn = function (frequency, velocity, note){
        // call trigger
        //player(midiNote, velocity);
        self.oscillators[frequency] = self.context.createOscillator();
        self.oscillators[frequency].frequency.value = frequency;
        self.oscillators[frequency].connect(self.context.destination);
        self.oscillators[frequency].connect(self.recordDestination);
        self.oscillators[frequency].start(self.context.currentTime);

        var key = self.midiNoteToKeyboardIndex(note);
        self.keyboard.toggle(self.keyboard.keys[key]);

    }

    /**
     * Converts midi note to index of the keyboard.keys objects
     * so that the bottom note is middle C
     *
     * @param  {int} note  The midi note
     * @return {int} index The index of the keyboard.keys array
     */
    this.midiNoteToKeyboardIndex = function (note) {
        return note - 48;
    };

    /**
     * Note is being released
     */
    this.noteOff = function (frequency, velocity, note){
        // call release
        //player(midiNote, velocity);
        self.oscillators[frequency].stop(self.context.currentTime);
        self.oscillators[frequency].stop(self.recordDestination.currentTime);
        self.oscillators[frequency].disconnect();

        var key = self.midiNoteToKeyboardIndex(note);
        self.keyboard.toggle(self.keyboard.keys[key]);

    }

    /**
     * Record midi input
     */
    this.startRecordMidi = function () {
       this.mediaRecorder.start();
    };

    /**
     * Record midi input
     */
    this.stopRecordMidi = function () {
       this.mediaRecorder.stop();
    };

    /**
     * Clear recording
     */
    this.clearRecording = function () {
    };

    // Check if MIDI is available
    if (navigator.requestMIDIAccess) {
        // Request MIDI access
        navigator.requestMIDIAccess().then(self.onMIDISuccess, self.onMIDIFailure);

    } else {
        alert("No MIDI support in your browser.");
    }


    return this;
}

/**
 * Start the loop synth
 */
Synth.prototype.start = function () {
    // Start the recorded audio buffer
    // Start the drawing syncing on the keyboard
};

/**
 * Stop the loop synth
 */
Synth.prototype.stop = function () {
    // stop the recorded audio buffer
};

/**
 * Set the settings click handler
 *
 * @param {object} settings  An object that contains the Jquey objects of
 *                           elements in the settings popup
 */
Synth.prototype.setSettingsClickHandler = function (settings) {

    // Reference to self
    var self = this;

    // Init empty track snapshot
    var trackSnapshot = false;

    // Flag for recording click
    var clicked = false;

    // Add the spinning animation to the settings icon on hover
    settings.icon.hover(
        function() {
            settings.icon.addClass('fa-spin');
        }, function() {
            settings.icon.removeClass('fa-spin');
        }
    );

    // On click handler for the settings icon
    settings.icon.on('click', function (event) {

        // Get clone of the object as it is
        trackSnapshot = deepClone(self.track);

        // Toggle the popup
        settings.popup.toggle(400, function () {
        });

    });

    // On click handler for the settings icon
    settings.cancelBtn.on('click', function (event) {

        // Set the original values back

        // Toggle popup
        settings.popup.toggle(400);

    });

    // On click for record
    settings.recordBtn.on('click', function (event) {

        // Check if clicked
        if (!clicked) {
            // Not clicked, record midi
            self.startRecordMidi();
            event.target.innerHTML = "Stop recording";
            clicked = true;
        } else {
            // Is clicked, stop recording
            self.stopRecordMidi();
            event.target.disabled = true;
        }

    });


    // On click for clear recording
    settings.clearBtn.on('click', function (event) {

        self.clearRecording();

    });

    // On click handler for the settings icon
    settings.confirmBtn.on('click', function (event) {

        // Confirm choice of sample and push to other clients

        // Push changes
        self.pushChanges();

        // Overwrite the track snapshot
        trackSnapshot = deepClone(self.track);

        // Close the popup
        settings.popup.toggle(400);

    });

};

/**
 * Set the initialised flag, used when instrument is initalised
 * fresh, without exisiting track JSON data
 */
Synth.prototype.setInitialised = function () {
    // Track has been initialised
    this.isInitialised = true;
};

/**
 * Mute the track click handler
 *
 * @param {JQuery} muteDiv  The div containing the mute icons
 */
Synth.prototype.setMuteClickHandler = function (muteDiv) {

    // Ref. to self
    var self = this;

    // Click handler
    muteDiv.on('click', function (event) {

        // Toggle the colour class to know its active
        muteDiv.toggleClass('secondary-colour');

    });

};

/**
 * Set the volume of the track
 *
 * @param {JQuery object} volume  The volume slider jquery object
 */
Synth.prototype.setVolume = function (volume) {

    var self = this;

    // Set the class volumeDOM variable
    this.volumeDOM = volume;

    this.volumeDOM.on('input', function(event) {

        // Get the volume value in decibles
        var db = parseInt(event.target.value);

        // Set the track volume
        self.track.volume = db;

        // Push changes of the track to the arrangement
        self.pushChanges();

    });

};

/**
 * Set the track JSON object, used for the syncing/updating of tracks from
 * other clients.
 *
 * @param {object} track  JSON object of the track
 */
Synth.prototype.setTrackJSON = function (track) {

    // Ref to self
    var self = this;

    // Check if volume has been changed
    if (this.track.volume != track.volume) {
        // Volume has been changed, update it

        // Set the slider value
        this.volumeDOM.val(track.volume);

    }

    // Set the track json
    this.track = deepClone(track);

    // Track has been initialised
    this.isInitialised = true;

};

/**
 * Get the track JSON
 *
 * @return {object} this.track  The track JSON object
 */
Synth.prototype.getTrackJSON = function () {
    return this.track;
};

/**
 * Get the synth ID
 *
 * @returns {string} id  The track id of this synth
 */
Synth.prototype.getId = function () {
    return this.track.id;
};

/**
 * Set the keyboard UI element
 *
 * @param {object} keyboard  The keyboard ui component
 */
Synth.prototype.setKeyboard = function (keyboard) {
    this.keyboard = keyboard;
};

module.exports = Synth;

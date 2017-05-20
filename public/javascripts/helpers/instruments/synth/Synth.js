var Tone = require('tone');
var deepClone = require('../../../helpers/deepclone');
var arrangement = require('../../../model/arrangement');
var trigger = require('../../../helpers/trigger');
var pako = require('pako');
var MasterPlaybackControl = require('../../../helpers/MasterPlaybackControl');

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

    // Init mute variable
    this.mute = false;

    // Initialse volume DOM element as false
    this.volumeDOM = false;

    // Attack slider
    this.osc1AttackSlider = false;
    this.osc2AttackSlider = false;

    // Release slider
    this.osc1ReleaseSlider = false;
    this.osc2ReleaseSlider = false;

    // Type select doms
    this.osc1TypeSelect = false;
    this.osc2TypeSelect = false;

    // Detune select Doms
    this.osc1DetuneSelect = false;
    this.osc2DetuneSelect = false;

    // The keyboard ui object
    this.keyboard = false;

    // Playing
    this.playing = false;

    // Track selected flag
    this.trackSelected = false;

    // The recorded buffer waveform
    this.waveform = false;

    // The recorded buffer waveform
    this.waveformRow = false;

    // Create osc one and two types
    this.osc1Type = 'sawtooth';
    this.osc2Type = 'triangle';

    // Set detune values
    this.osc1Detune = -10;
    this.osc2Detune = 10;

    // Create attack values and release
    this.osc1Attack = 0;
    this.osc2Attack = 0;
    this.osc1Release = 0;
    this.osc2Release = 0;

    // Init gain nodes for osc
    this.oscGain = null;
    this.osc2Gain = null;

    // Ref to self
    var self = this;

    // Object to hold midi info
    this.midi = false;

    // Init Abuffer
    this.audioBuffer = null;

    // Init audio DOM holder
    this.ai = null;

    // Create audio context
    this.context = new AudioContext();
    this.oscillators = {};

    // Init master volume for the synth
    this.masterVolume = this.context.createGain();
    this.masterVolume.connect(this.context.destination);
    this.masterVolume.gain.value = 0.2;

    // Init chunks array to hold data to create blob
    this.chunks = [];

    // Create source from audio context to hold AudioBuffer
    this.source = this.context.createBufferSource();
    this.source.connect(this.masterVolume);

    // Create recording destination
    this.recordDestination = this.context.createMediaStreamDestination();
    this.mediaRecorder = new MediaRecorder(this.recordDestination.stream);

    // init audiobuffer
    this.audioBuffer = this.context.createBuffer(2, 22050, 44100);

    // Init new file reader for converting blob
    this.fileReader = new FileReader();

    // Init empty array buffer
    this.arrayBuffer = new ArrayBuffer(8);

    // Init new instance of master control playback
    this.masterPlaybackControl = new MasterPlaybackControl();

    /**
     * Encode the channel data to ogg and then compress it
     *
     * @param  {Float32Array} channelData  The channel data to be encoded and compressed
     * @return {String}                    The encoded and compressed channel data
     */
    this.encodeAndCompressChannelData = function(channelData) {
        return pako.deflate(JSON.stringify(Codec.encode(channelData)), { to: 'string'});
    };

    /**
     * Uncompress the channel data, turn it to float32array and decode it
     *
     * @param {String} compressedChannelData  The compressed channel data
     * @return {Array}  channelDataArry  the decompressed and decoded array
     */
    this.uncompressAndDecodeChannelData = function (compressedChannelData) {

        // Decompress the string and parse back into object
        var channelDataObj = JSON.parse(pako.inflate(compressedChannelData, { to: 'string'}));

        // Convert the objects to arrays
        var channelDataArray = Object.keys(channelDataObj).map(function (key) { return channelDataObj[key]; })

        // Convert the arrays to Float32Arrays
        channelDataArray = new Float32Array(channelDataArray);

        // Decode the data
        channelDataArray = Codec.decode(channelDataArray);

        return channelDataArray;

    };

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

        // Compress the audio data
        var compressedChannel0Data = this.encodeAndCompressChannelData(this.audioBuffer.getChannelData(0));
        var compressedChannel1Data = this.encodeAndCompressChannelData(this.audioBuffer.getChannelData(1));

        // JSON object container meta data of track
        var track = {
            id: this.id,
            type: 'synth',
            volume: 0,
            audioBufferChannel0Data: compressedChannel0Data,
            audioBufferChannel1Data: compressedChannel1Data,
            audioBufferLength: this.audioBuffer.length,
            bufferStarttime: 0,
            bufferStoptime: 3,
            bufferDuration: 3,
            osc1Type: 'sawtooth',
            osc2Type: 'triangle',
            osc1Detune: -10,
            osc2Detune: 10,
            osc1Attack: 0,
            osc2Attack: 0,
            osc1Release: 0,
            osc2Release: 0
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

    /**
     * When media recorder receives data, push it to chunks array
     *
     * @param {object} evt  The event
     */
    this.mediaRecorder.ondataavailable = function(evt) {
        // push each chunk (blobs) in an array
        self.chunks.push(evt.data);
    };

    /**
     * The filereaders onload end method,
     * passes the filereader result (ArrayBuffer) to the createAudioBuffer
     * function to turn it into an audio buffer. Resets the chunks array
     * used to hold the buffer information.
     *
     */
    this.fileReader.onloadend = function () {

        // Create audio buffer
        self.createAudioBuffer(self.fileReader.result);

        // reset the chunks
        self.chunks = [];
    };

    /**
     * When media recorder stops recording, create blob for audio
     * and convert that into a buffer for the source
     *
     * @param {object} evt  The event
     */
    this.mediaRecorder.onstop = function(evt) {

        // Show the loading screen
        self.masterPlaybackControl.showLoadingOverlay();

        // Make blob out of our blobs, and open it
        var blob = new Blob(self.chunks, {'type' : 'audio/ogg; codecs=opus'});

        // Read the blob into array buffer
        self.fileReader.readAsArrayBuffer(blob);

        // Create doc element
        //self.ai = document.createElement("audio");
        //self.ai.src = URL.createObjectURL(blob);
        //document.getElementById(self.id).appendChild(self.ai);
    };

    /**
     * Create audio buffer from ArrayBuffer. Resets the class audio buffer
     * Re-renders the waveform and resumes play with new buffer if track was
     * playing.
     *
     * @param {ArrayBuffer} arrayBuffer  The array buffer converted from the blob
     */
    this.createAudioBuffer = function (arrayBuffer) {

        // Decode the array buffer and covert to AudioBuffer
        this.context.decodeAudioData(arrayBuffer).then(function(decodedData) {

            // Recreate the audio buffer
            self.audioBuffer =
                self.recreateAudioBuffer(
                    self.encodeAndCompressChannelData(decodedData.getChannelData(0)),
                    self.encodeAndCompressChannelData(decodedData.getChannelData(1)),
                    decodedData.length
                );

            // Set the track variables
            self.track.audioBufferChannel0Data = self.encodeAndCompressChannelData(decodedData.getChannelData(0));
            self.track.audioBufferChannel1Data = self.encodeAndCompressChannelData(decodedData.getChannelData(1));
            self.track.audioBufferLength = decodedData.length;

            // Reset the audio buffer source
            self.resetAudioBufferSource();

            // Render the waveform
            self.renderWaveform(self.waveformRow);

            // Add the watcher
            self.addWaveformWatcher();

            // Check if playing
            if (self.playing) {
                // Start the audio again
                //self.playing = false;
                //self.start();
                self.masterPlaybackControl.startPlayback();

            }

            // Hide loading overlay
            self.masterPlaybackControl.hideLoadingOverlay();

        });

    };

    /**
     * The handler for the incoming MIDI messages
     *
     * @param {object} message  The MIDI message
     */
    this.onMIDIMessage = function (message) {

        // Check if track is selected to play
        if (!self.trackSelected) {
            // Not selected, don't trigger notes
            return this;
        }

        // This gives us our [command/channel, note, velocity] data
        var data = message.data;

        // Extract the info from the data
        var cmd = data[0] >> 4;
        var channel = data[0] & 0xf;
        var type = data[0] & 0xf0;
        var note = data[1];
        var velocity = data[2];
        var frequency = self.midiNoteToFrequency(message.data[1]);

        // Handle the type of message
        switch(type){
            case 144: // noteOn message 
                self.noteOn(frequency, velocity, note);
                break;
            case 128: // noteOff message 
                self.noteOff(frequency, velocity, note);
                break;
        }

    };

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
     * On success message for connecting MIDI
     *
     * @param {object} midiAccess  The access object to midi
     */
    this.onMIDISuccess = function (midiAccess) {

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

    }

    /**
     * Recongises state change/disconnect
     */
    this.onStateChange = function (message){
        var port = message.port,
            state = port.state,
            name = port.name,
            type = port.type;
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
     * On failure for MIDI alert user to switch browser
     *
     * @param {error} e  The error for not connecting
     */
    this.onMIDIFailure = function (e) {
        // when we get a failed response, run this code
        alert("No access to MIDI devices or your browser doesn't support WebMIDI API.\nPlease use Chrome Canary for the MIDI capabailities.");
    }

    /**
     * Note is being pressed, create oscillators and start them.
     *
     * @param {int}      frequency The frequency of the MIDI note
     * @param {velocity} velocity  The velocity of the MIDI note
     * @param {note}     note      The MIDI note
     */
    this.noteOn = function (frequency, velocity, note){

        // Get current time audio context time
        var now = this.context.currentTime;

        // Get the attack values
        var osc1AttackVal = now + this.osc1Attack;
        var osc2AttackVal = now + this.osc2Attack;

        // Create the oscilators
        var osc = this.context.createOscillator(),
            osc2 = this.context.createOscillator();

        this.oscGain = this.context.createGain(),
        this.osc2Gain = this.context.createGain();

        this.oscGain.gain.value = 0.0;
        this.osc2Gain.gain.value = 0.0;

        // Set the frequency
        osc.frequency.value = frequency;
        osc2.frequency.value = frequency;

        // Set the osc type
        osc.type = this.osc1Type;
        osc2.type = this.osc2Type;

        // Set detune values
        osc.detune.value = this.osc1Detune;
        osc2.detune.value = this.osc2Detune;

        // Connect them to the master volume gain node
        osc.connect(this.oscGain);
        osc2.connect(this.osc2Gain);

        // Connect individual gain nodes to master gain
        this.oscGain.connect(this.masterVolume);
        this.osc2Gain.connect(this.masterVolume);

        // Connect the out of context
        this.masterVolume.connect(this.context.destination);

        // Connect the recorder
        this.masterVolume.connect(this.recordDestination);

        // Set the frequencies
        this.oscillators[frequency] = [osc, osc2];

        // Set ramp up for attack
        this.oscGain.gain.cancelScheduledValues(now);
        this.oscGain.gain.setValueAtTime(this.oscGain.gain.value, now);
        this.oscGain.gain.linearRampToValueAtTime(1 , osc1AttackVal);

        // Set ramp up for attack
        this.osc2Gain.gain.cancelScheduledValues(now);
        this.osc2Gain.gain.setValueAtTime(this.osc2Gain.gain.value, now);
        this.osc2Gain.gain.linearRampToValueAtTime(1 , osc2AttackVal);

        // Start the context
        osc.start(this.context.currentTime);
        osc2.start(this.context.currentTime);

        // Display the key on the keyboard canvas
        var key = self.midiNoteToKeyboardIndex(note);
        self.keyboard.toggle(self.keyboard.keys[key]);

    }

    /**
     * Note is being released
     */
    this.noteOff = function (frequency, velocity, note){

        var now = this.context.currentTime;

        // Get the release values
        var osc1ReleaseVal = now + this.osc1Release;
        var osc2ReleaseVal = now + this.osc2Release;

        // Cancel scheduled values
        this.oscGain.gain.cancelScheduledValues(now);
        this.osc2Gain.gain.cancelScheduledValues(now);

        // Set the value
        this.oscGain.gain.setValueAtTime(this.oscGain.gain.value, now);
        this.osc2Gain.gain.setValueAtTime(this.osc2Gain.gain.value, now);

        // Release the note
        this.oscGain.gain.linearRampToValueAtTime(0.0, osc1ReleaseVal);
        this.osc2Gain.gain.linearRampToValueAtTime(0.0, osc2ReleaseVal);

        this.oscillators[frequency][0].stop(osc1ReleaseVal);
        this.oscillators[frequency][1].stop(osc2ReleaseVal);

        // Turn off display on keyboard
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
     * Record midi input
     */
    this.startRecordMidi = function () {
        this.mediaRecorder.start();
    };

    /**
     * Record midi input
     */
    this.stopRecordMidi = function () {
        // Stop recording
        this.mediaRecorder.stop();
    };

    /**
     * Clear recording. Stop playing if audio is playing but maintain state.
     * Init an empty audio buffer and re-render waveform with empty buffer
     * and start playing the source again to maintain that state.
     */
    this.clearRecording = function () {

        // Check if playing
        if (this.playing) {
            // Playing but maintain state
            //this.stop();
            this.masterPlaybackControl.stopPlayback();
            this.playing = true;
        }

        // Init empty audio buffer
        this.audioBuffer = this.context.createBuffer(2, 22050, 44100);

        // set the audio source node
        this.resetAudioBufferSource();

        // Re-render the waveform
        this.renderWaveform(this.waveformRow);

        // Check if playing
        if (this.playing) {
            // Playing but maintain state
            //this.playing = false;
            //this.start();
            this.masterPlaybackControl.startPlayback();
        }

    };

    // Check if MIDI is available
    if (navigator.requestMIDIAccess) {
        // Request MIDI access
        navigator.requestMIDIAccess().then(self.onMIDISuccess, self.onMIDIFailure);

    } else {
        alert("No MIDI support in your browser.");
    }

    /**
     * Re-/Renders the waveform in the popup
     *
     * @param  {DOM}       waveformRow  The html dom to be added to
     * @return {Synth}                  Implement fluent interface
     */
    this.renderWaveform = function (waveformRow) {

        // Check if one has been created
        if (this.waveform != false) {
            // One already present, destroy it
            this.waveform.destroy();
        }

        // Create unique name for the waveform
        var waveformName = "waveform-" + self.id;

        // Add the waveform to widgets
        nx.add(
                "waveform",
                {
                    w: 825,
                    h: 160,
                    name: waveformName,
                    parent: waveformRow
                }
              );

        // Get the newly created waveform
        for(widget in nx.widgets) {
            if (nx.widgets.hasOwnProperty(widget)) {
                if (widget == waveformName) {
                    this.waveform = nx.widgets[widget];
                    break;
                }
            }
        }

        // Set the parameters for the buffer
        this.waveform.setBuffer(this.audioBuffer);
        this.waveform.colors.fill = "#ffffff";
        this.waveform.definition = 1;
        this.waveform.select((this.track.bufferStarttime * 1000), (this.track.bufferStoptime * 1000));
        this.waveform.mode = "edge";
        this.waveform.init();

        // implement fluent interface
        return this;

    };

    /**
     * Add a observer to the val object inside the waveform
     *
     * @return {Synth}  Implment fluent interface
     */
    this.addWaveformWatcher = function () {

        // Add watcher
        WatchJS.watch(self.waveform, "val", function (prop, action, newvalue) {

            // Check if the property val is set and only set if not playing
            if (prop == "val" && action == "set") {

                // Set the new start, stop times and duration
                self.track.bufferStarttime = (newvalue.starttime / 1000);
                self.track.bufferStoptime = (newvalue.stoptime / 1000);
                self.track.bufferDuration = ((newvalue.stoptime - newvalue.starttime) / 1000);

                // Edit the loop start n stop time
                self.source.loopEnd = self.track.bufferStoptime;
                self.source.loopStart = self.track.bufferStarttime;

            }

        });

        // Implement fluent interface
        return this;

    };

    /**
     * Reset the audio buffer source with buffer
     * @return {Synth} Implement fluent interface
     */
    this.resetAudioBufferSource = function () {

        // Recreate the source buffer
        this.source = this.context.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.context.destination);
        this.source.connect(this.masterVolume);
        this.source.loop = true;

        // Set the tracks audio buffer
        this.track.audioBuffer = this.audioBuffer;

        return this;
    };

    /**
     * Recreate the audio buffer from the channel data
     * arrays and length
     *
     * @param {string} channel0Data  The channel 0 data as an object
     * @param {string} channel1Data  The channel 0 data as an object
     * @param {int}    length        The length of the audio buffer
     * @return {AudioBuffer} AudioBuffer  The recreated AudioBuffer
     */
    this.recreateAudioBuffer = function (channel0Data, channel1Data, length) {

        // Init empty buffer
        var audioBuffer = this.context.createBuffer(2, length, 44100);

        // Decompress and decode
        var channel0DataArray = this.uncompressAndDecodeChannelData(channel0Data);
        var channel1DataArray = this.uncompressAndDecodeChannelData(channel1Data);

        // Copy the data to the channel
        audioBuffer.copyToChannel(channel0DataArray, 0);
        audioBuffer.copyToChannel(channel1DataArray, 1);

        return audioBuffer;

    };

    // Implement fluent interface
    return this;
}

/**
 * Start the loop synth
 */
Synth.prototype.start = function () {

    // Check if playing already
    if (this.playing) {
        return this;
    }

    // Set buffer loop stop and start time
    this.source.loopEnd = this.track.bufferStoptime;
    this.source.loopStart = this.track.bufferStarttime;

    // Not playing, start the buffer now, with offset of starttime
    this.source.start(
            this.context.currentTime,
            this.track.bufferStarttime
            );

    // Set playing to true
    this.playing = true;

};

/**
 * Stop the loop synth
 */
Synth.prototype.stop = function () {

    // Check if not playing
    if (!this.playing) {
        return this;
    }

    // Audio is playing, stop it
    this.source.stop();

    // Set flag
    this.playing = false;

    // Recreate buffer source node
    this.resetAudioBufferSource();

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

    // Assign the dom elements
    this.osc1AttackSlider = settings.osc1AttackSlider;
    this.osc2AttackSlider = settings.osc2AttackSlider;
    this.osc1ReleaseSlider = settings.osc1ReleaseSlider;
    this.osc2ReleaseSlider = settings.osc2ReleaseSlider;
    this.osc1TypeSelect = settings.osc1TypeSelect;
    this.osc2TypeSelect = settings.osc2TypeSelect;
    this.osc1DetuneSelect = settings.osc1DetuneSelect;
    this.osc2DetuneSelect = settings.osc2DetuneSelect;
    this.waveformRow = settings.waveformRow;

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

            // Set the drop downs
            settings.osc1TypeSelect.val(self.osc1Type);
            settings.osc2TypeSelect.val(self.osc2Type);
            settings.osc1DetuneSelect.val(self.osc1Detune);
            settings.osc2DetuneSelect.val(self.osc2Detune);

            // Set sliders
            settings.osc1AttackSlider.val(self.osc1Attack);
            settings.osc2AttackSlider.val(self.osc2Attack);
            settings.osc1ReleaseSlider.val(self.osc1Release);
            settings.osc2ReleaseSlider.val(self.osc2Release);

            // Render the waveform
            self.renderWaveform(settings.waveformRow);

            // Add the watcher
            self.addWaveformWatcher();

            // Check if audio buffer isn't equal to default length
            if (22050 != self.track.audioBufferLength) {
                // Disable the recording button
                settings.recordBtn.prop('disabled', true);
            }

        });

    });

    // On click handler for the settings icon
    settings.cancelBtn.on('click', function (event) {

        // Set the original class variables back
        self.osc1Type = trackSnapshot.osc1Type;
        self.osc2Type = trackSnapshot.osc2Type;
        self.osc1Detune = trackSnapshot.osc1Detune;
        self.osc2Detune = trackSnapshot.osc2Detune;
        self.osc1Attack = trackSnapshot.osc1Attack;
        self.osc2Attack = trackSnapshot.osc2Attack;
        self.osc1Release = trackSnapshot.osc1Release;
        self.osc2Release = trackSnapshot.osc2Release;

        // Reset the track json
        self.track = deepClone(trackSnapshot);

        // THIS DOESN'T WORK
        // Reset buffer source
        self.resetAudioBufferSource();

        // Toggle popup
        settings.popup.toggle(400);

    });

    // On click handler for the settings icon
    settings.confirmBtn.on('click', function (event) {

        // Set the track params to be synced
        self.track.osc1Type = self.osc1Type;
        self.track.osc2Type = self.osc2Type;
        self.track.osc1Detune = self.osc1Detune;
        self.track.osc2Detune = self.osc2Detune;
        self.track.osc1Attack = self.osc1Attack;
        self.track.osc2Attack = self.osc2Attack;
        self.track.osc1Release = self.osc1Release;
        self.track.osc2Release = self.osc2Release;

        // Push changes
        self.pushChanges();

        // Overwrite the track snapshot
        trackSnapshot = deepClone(self.track);

        // Close the popup
        settings.popup.toggle(400);

    });


    // On click for record
    settings.recordBtn.on('click', function (event) {

        // Check if track is selected
        if (!self.trackSelected) {
            alert('Please select the track before recording! The selector box is next to the trash can');
            return;
        }

        // Check if clicked
        if (!clicked) {
            // Check if this is playing
            if (self.playing) {
                // Is playing, stop before recording
                self.stop();
            }

            // Not clicked, record midi
            self.startRecordMidi();
            event.target.innerHTML = "Stop recording";
            clicked = true;

            // Disable buttons
            settings.clearBtn.prop('disabled', true);
            settings.cancelBtn.prop('disabled', true);
            settings.confirmBtn.prop('disabled', true);

        } else {
            // Is clicked, stop recording
            self.stopRecordMidi();
            clicked = false;

            // Enable/disable buttons
            event.target.disabled = true;
            settings.clearBtn.prop('disabled', false);
            settings.cancelBtn.prop('disabled', false);
            settings.confirmBtn.prop('disabled', false);

        }

    });

    // On click for clear recording
    settings.clearBtn.on('click', function (event) {

        // Clear the recording
        self.clearRecording();

        // Reset the button
        settings.recordBtn.html('Record');
        settings.recordBtn.prop('disabled', false);

    });

    // Select list handler for osc1 type
    this.osc1TypeSelect.change(function (event) {
        // Get the new type and set it to class variable
        self.osc1Type = settings.osc1TypeSelect.val();
    });

    // Select list handler for osc2 type
    this.osc2TypeSelect.change(function (event) {
        // Get the new type and set it to class variable
        self.osc2Type = settings.osc2TypeSelect.val();
    });

    // Select list handler for osc1 type
    this.osc1DetuneSelect.change(function (event) {
        // Get the new type and set it to class variable
        self.osc1Detune = parseInt(settings.osc1DetuneSelect.val());
    });

    // Select list handler for osc2 type
    this.osc2DetuneSelect.change(function (event) {
        // Get the new type and set it to class variable
        self.osc2Detune = parseInt(settings.osc2DetuneSelect.val());
    });

    // On input for osc1 attack slider
    this.osc1AttackSlider.on('input', function (event) {
        // Set the attack value
        self.osc1Attack = parseFloat(event.target.value);
    });

    // On input for osc2 attack slider
    this.osc2AttackSlider.on('input', function (event) {
        // Set the attack value
        self.osc2Attack = parseFloat(event.target.value);
    });

    // On input for osc2 release slider
    this.osc1ReleaseSlider.on('input', function (event) {
        // Set the attack value
        self.osc1Release = parseFloat(event.target.value);
    });

    // On input for osc2 release slider
    this.osc2ReleaseSlider.on('input', function (event) {
        // Set the attack value
        self.osc2Release = parseFloat(event.target.value);
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

        // Mute keep track of the variable state
        self.mute == true ? self.mute = false : self.mute = true;

        // Toggle the colour class to know its active
        muteDiv.toggleClass('secondary-colour');

        // Mute the track
        if (self.mute) {
            self.stop();
        } else {
            self.start();
        }

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
        var db = parseFloat(event.target.value);

        // Set the track volume
        self.track.volume = db;

        // Set the master volume
        self.masterVolume.gain.value = db;

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

        // Set the master volume
        this.masterVolume.gain.value = track.volume;

    }

    // Set the attack sliders
    this.osc1AttackSlider.val(track.osc1Attack);
    this.osc2AttackSlider.val(track.osc2Attack);

    // Set the attack values
    this.osc1Attack = track.osc1Attack;
    this.osc2Attack = track.osc2Attack;

    // Set the release sliders
    this.osc1ReleaseSlider.val(track.osc1Release);
    this.osc2ReleaseSlider.val(track.osc2Release);

    // Set release values
    this.osc1Release = track.osc1Release;
    this.osc2Release = track.osc2Release;

    // Set the osc type drop downs
    this.osc1TypeSelect.val(track.osc1Type);
    this.osc2TypeSelect.val(track.osc2Type);

    // Set the osc types
    this.osc1Type = track.osc1Type;
    this.osc2Type = track.osc2Type;

    // Set the osc detune drop downs
    this.osc1DetuneSelect.val(track.osc1Detune);
    this.osc2DetuneSelect.val(track.osc2Detune);

    // Set detune vals
    this.osc1Detune = track.osc1Detune;
    this.osc2Detune = track.osc2Detune;

    // Check if the audio buffer has been changed
    if (this.track.audioBufferLength != track.audioBufferLength
        || this.track.audioBufferChannel0Data != track.audioBufferChannel0Data
        || this.track.audioBufferChannel1Data != track.audioBufferChannel1Data)
    {
        // New audio buffer is available

        // Check if initialised
        if (this.isInitialised && true == this.playing) {
            // Is initialised, and playing

            // Stop the playback
            this.masterPlaybackControl.stopPlayback();

            // Tell the user what is happening
            alert('A new audio track is being synchronised, please wait!');

        }

        // Set the audio buffer
        this.audioBuffer =
            this.recreateAudioBuffer(
                    track.audioBufferChannel0Data,
                    track.audioBufferChannel1Data,
                    track.audioBufferLength
                    );

        // Reset the audio buffer source
        this.resetAudioBufferSource();

        // Check if initialised
        if (this.isInitialised && true == this.playing) {
            // Start the playback again
            this.masterPlaybackControl.startPlayback();
        }

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

/**
 * Track selected checkbox btn handler
 *
 * @param {object} trackSelectedCheckbox  The JQuery Checkbox item for this track
 */
Synth.prototype.setTrackSelectedClickHandler = function (trackSelectedCheckbox) {

    // Ref to self
    var self = this;

    // On checkbox change
    trackSelectedCheckbox.change(function(){

        // If checked, set track selected to true
        self.trackSelected = this.checked ? true : false;

    });
};

/**
 * Get the type of the track
 *
 * @returns {string} type  The track type
 */
Synth.prototype.getTrackType = function () {
    return this.track.type;
};

/**
 * Close the audio context
 */
Synth.prototype.closeAudioContext = function () {
    this.context.close();
};

/**
 * Get the audio buffer
 *
 * @return {Promise}  A promise which resolves with the AudioBuffer
 */
Synth.prototype.getAudioBuffer = function () {
    // Ref to self
    var self = this;
    return new Promise(function (resolve, reject) {
        resolve(self.audioBuffer);
    });
};

module.exports = Synth;

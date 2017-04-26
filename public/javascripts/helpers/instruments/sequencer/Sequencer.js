var Tone = require('tone');
var proxify = require('../../../helpers/proxify');
var deepClone = require('../../../helpers/deepclone');
var arrangement = require('../../../model/arrangement');

// Start the tone timer
Tone.Transport.start();

/**
 * Constructor
 *
 * @param {string|bool} id  If track already exists from client or initalise
 *                          use the id to create it
 * @returns{Sequencer}      Instance of itself
 */
function Sequencer (id) {

    // Initialise empty matrix
    this.steps;

    // Init local guid
    this.id = id;

    // Init base url string
    this.baseURL = '../../audio/';

    // Reference to self
    var self = this;

    // Audio buffer of the class
    this.audioBuffer = false;

    // The waveform of the sequencer
    this.waveform = false;

    // The dials for the eqs
    this.eqLowDial  = false;
    this.eqMidDial  = false;
    this.eqHighDial = false;

    // Init a eq for the sample
    this.eq3 = new Tone.EQ3().toMaster();

    // Create a player and connect it to the master output (your speakers)
    this.source = new Tone.Player("../../audio/727-HM-CONGA.WAV", function () {

        // Set the buffer
        self.setBuffer(self.source.buffer.get());

    }).connect(this.eq3);

    // Set initialised flag
    this.isInitialised = false;

    // Initialse volume DOM element as false
    this.volumeDOM = false;

    /**
     * Sets the buffer - called from onload callback of player
     * And sets the waveform
     *
     * @param  {AudioBuffer} buffer  The audio buffer from player
     * @return {Sequencer}   this    Instance of class
     */
    this.setBuffer = function (buffer) {

        // Set buffer and waveform
        this.audioBuffer = buffer;

        // Implement fluent interface
        return this;
    };

    // Sequence notes
    this.seq = new Tone.Sequence(function(time, col) {

        // Get the array of columns from the matrix
        var column = self.steps.matrix[col];

        // Jump to the current cell to highlight the block
        self.steps.jumpToCol(col);

        // If cell has value, play the note
        if (1 === column[0]) {

            // Try to play the buffer
            try {

                // Play immediately, at the start time and for the duration
                self.source.start(
                    0,
                    parseFloat(self.track.bufferStarttime),
                    parseFloat(self.track.bufferDuration)
                );

            }
            catch (e) {
                // Siliently fail in the hopes it would have loaded next time it plays
            }
        }

    }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n');

    /**
     * Track struct
     * {
     *    id: 'id',
     *    type: 'step-sequencer',
     *    volume: 60,
     *    pattern: this.steps.matrix
     * }
     */
    this.createTrackJSON = function () {

        // JSON object container meta data of track
        var track = {
            id: this.id,
            type: 'step-sequencer',
            volume: self.source.volume.value,
            pattern: [],
            bufferName: '727-HM-CONGA.WAV',
            bufferStarttime: 0,
            bufferStoptime: 3,
            bufferDuration: 3,
            eqLowVal : 0,
            eqMidVal : 0,
            eqHighVal: 0
        };

        return track;
    };

    // Init JSON struct of the track
    this.track = this.createTrackJSON();

    // Add the track to the arrangement
    arrangement.addTrack(deepClone(this.track));

    /**
     * Proxy that picks up the changes when a step is pressed and sets the track
     * pattern to the steps
     */
    this.setStepsObserver = function () {

        // Proxify the steps
        proxify(this.track, function(object, property, oldValue, newValue) {

            // If it hasn't been initialised, stop it setting the track and triggering
            // a change
            if (self.isInitialised == false) {
                return;
            }

            // Set the track pattern
            self.track.pattern = self.steps.matrix;

            // Push the changes of the track to the arrangement
            self.pushChanges();
        });

    };

    /**
     * Push track changes to the arrangement
     */
    this.pushChanges = function () {

        // replace the track in the arrangement with updated track
        arrangement.replaceTrack(deepClone(this.track));

    };

    /**
     * Re-/Renders the waveform in the popup
     *
     * @param  {DOM}       waveformRow  The html dom to be added to
     * @return {Sequencer}              Implement fluent interface
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
                w: 264,
                h: 140,
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
        this.waveform.init();

        // implement fluent interface
        return this;

    };

    /**
     * Renders/re-renders the dials for the eq3
     *
     * @param {DOM} eq3Row  The javascript created DOM for eq3 row of dials
     */
    this.renderEq3Dials = function (eq3Row) {

        // Check if any of one of the dials has been created before
        if (this.eqLowDial != false) {
            // Already present, destroy them
            this.eqLowDial.destroy();
            this.eqMidDial.destroy();
            this.eqHighDial.destroy();
        }

        // Create the unique widget names for the dials
        var eqLowDialName = "eqLowDial-" + self.id;
        var eqMidDialName = "eqMidDial-" + self.id;
        var eqHighDialName = "eqHighDial-" + self.id;

        // Create them
        this.eqLowDial = this.createDial(eqLowDialName, eq3Row, this.track.eqLowVal);
        this.eqMidDial = this.createDial(eqMidDialName, eq3Row, this.track.eqMidVal);
        this.eqHighDial = this.createDial(eqHighDialName, eq3Row, this.track.eqHighVal);

        return this;

    };

    /**
     * Create the dials adding to nx widgets and returning created object
     *
     * @param {string} dialName  The dial name
     * @param {object} eq3Row    The row to add the dials to
     * @param {number} value     The value of the eq
     * @return {nxWidget}        The created widget
     */
    this.createDial = function (dialName, eq3Row, value) {

        // Init empty variable for the dial to be assigned to
        var dialObject;

        // Add the dial to the widgets
        nx.add(
            "dial",
            {
                w: 75,
                h: 75,
                name: dialName,
                parent: eq3Row
            }
        );

        // Get the newly created dial
        for(widget in nx.widgets) {
            if (nx.widgets.hasOwnProperty(widget)) {
                if (widget == dialName) {
                    dialObject = nx.widgets[widget];
                    break;
                }
            }
        }

        // Set the parameters for the buffer
        dialObject.colors.accent = "#FFBB4C";
        dialObject.min = -15;
        dialObject.max = 15;
        dialObject.val.value = value;
        dialObject.init();

        // Implement fluent interface
        return dialObject;

    };

    /**
     * Add a observer to the val object inside the dials
     *
     * @return {Sequencer}  Implment fluent interface
     */
    this.addEq3Watcher = function () {

        // Add watcher
        WatchJS.watch(self.eqLowDial, "val", function (prop, action, newvalue) {

            // Check if the property val is set
            if (prop == "value" && action == "set") {
                // Set the new eq values
                self.track.eqLowVal = newvalue;
                self.eq3.low.value = newvalue;
            }

        });

        // Add watcher
        WatchJS.watch(self.eqMidDial, "val", function (prop, action, newvalue) {

            // Check if the property val is set
            if (prop == "value" && action == "set") {
                // Set the new eq vals
                self.track.eqMidVal = newvalue;
                self.eq3.mid.value = newvalue;
            }

        });

        // Add watcher
        WatchJS.watch(self.eqHighDial, "val", function (prop, action, newvalue) {

            // Check if the property val is set
            if (prop == "value" && action == "set") {
                // Set the new eq values
                self.track.eqHighVal = newvalue;
                self.eq3.high.value = newvalue;
            }

        });

        // Implement fluent interface
        return this;

    };

    /**
     * Add a observer to the val object inside the waveform
     *
     * @return {Sequencer}  Implment fluent interface
     */
    this.addWaveformWatcher = function () {

        // Add watcher
        WatchJS.watch(self.waveform, "val", function (prop, action, newvalue) {

            // Check if the property val is set and only set if not playing
            if (prop == "val"
                && action == "set"
                && self.source.state != "started") {

                // Set the new start, stop times and duration
                self.track.bufferStarttime = (newvalue.starttime / 1000);
                self.track.bufferStoptime = (newvalue.stoptime / 1000);
                self.track.bufferDuration = ((newvalue.stoptime - newvalue.starttime) / 1000);
            }

        });

        // Implement fluent interface
        return this;

    };

    /**
     * Get the full path to the sample to be loaded
     *
     * @param {string}  bufferName  The name of the buffer
     * @return {string}             The full path to sample
     */
    this.getSamplePath = function (bufferName) {
        return this.baseURL + bufferName;
    };

    return this;
};

/**
 * Start the loop sequence
 */
Sequencer.prototype.start = function () {
    // Start the Transport timer
    this.seq.start();
};

/**
 * Stop the loop sequence
 */
Sequencer.prototype.stop = function () {
    // Stop the transport timer
    this.seq.stop();

    // Reset and stop the matrix animation
    this.steps.jumpToCol(0);
    this.steps.stop();
};

/**
 * Set the matrix for the steps Sequencer
 *
* @param {DOM} matrix  The matrix DOM that is the steps of the sequencer
 */
Sequencer.prototype.setMatrix = function (matrix) {

    // Set the steps
    this.steps = matrix;

    // Set the track pattern
    this.track.pattern = matrix.matrix;

    // Set the steps observer
    this.setStepsObserver();

};

/**
 * Get the matrix for the steps sequencer
 *
 * @returns {matrix} steps  The steps for the sequencer
 */
Sequencer.prototype.getMatrix = function () {
    return this.steps;
};

/**
 * Set the volume of the track
 *
 * @param {JQuery object} volume  The volume slider jquery object
 */
Sequencer.prototype.setVolume = function (volume) {

    var self = this;

    // Set the class volumeDOM variable
    this.volumeDOM = volume;

    this.volumeDOM.on('input', function(event) {

        // Get the volume value in decibles
        var db = parseInt(event.target.value);

        // Set the volume
        self.source.volume.value = db;

        // Set the track volume
        self.track.volume = db;

        // Push changes of the track to the arrangement
        self.pushChanges();

    });

};

/**
 * Set the settings click handler
 *
 * @param {object} settings  An object that contains the Jquey objects of
 *                           elements in the settings popup
 */
Sequencer.prototype.setSettingsClickHandler = function (settings) {

    // Reference to self
    var self = this;

    // Init empty track snapshot
    var trackSnapshot = false;

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

            // Set the drop down
            settings.samplesList.val(self.track.bufferName);

            // Render the waveform
            self.renderWaveform(settings.waveformRow);

            // Add the watcher
            self.addWaveformWatcher();

            // Render the eq buttons
            self.renderEq3Dials(settings.eq3Row);

            // Add the watcher
            self.addEq3Watcher();

        });
    });

    // On click handler for the settings icon
    settings.cancelBtn.on('click', function (event) {

        // Set the original values back
        self.track.bufferStarttime = trackSnapshot.bufferStarttime;
        self.track.bufferStoptime  = trackSnapshot.bufferStoptime;
        self.track.bufferName      = trackSnapshot.bufferName;
        self.track.eqLowVal        = trackSnapshot.eqLowVal;
        self.eq3.low.value         = trackSnapshot.eqLowVal;
        self.track.eqMidVal        = trackSnapshot.eqMidVal;
        self.eq3.mid.value         = trackSnapshot.eqMidVal;
        self.track.eqHighVal       = trackSnapshot.eqHighVal;
        self.eq3.high.value        = trackSnapshot.eqHighVal;
        self.source.load(
            self.getSamplePath(trackSnapshot.bufferName),
            function () {
                self.setBuffer(self.source.buffer.get());
            }
        );

        // Toggle popup
        settings.popup.toggle(400);

    });

    // On click handler for the settings icon
    settings.confirmBtn.on('click', function (event) {

        // Confirm choice of sample and push to other clients
        // Get the new sample selected
        var sample = settings.samplesList.val();

        // Set it to the track
        self.track.bufferName = sample;

        // Push changes
        self.pushChanges();

        // Overwrite the track snapshot
        trackSnapshot = deepClone(self.track);

        // Close the popup
        settings.popup.toggle(400);
    });

    // Select list handler for on change
    settings.samplesList.change(function (event) {

        // Get the new sample selected
        var sample = settings.samplesList.val();

        // Load the sample and set the buffer
        self.source.load(self.getSamplePath(sample), function() {

            // Set the buffer
            self.setBuffer(self.source.buffer.get());

            // Render the waveform
            self.renderWaveform(settings.waveformRow);

            // Add the watcher
            self.addWaveformWatcher();

        });

    });
};

/**
 * Mute the track click handler
 *
 * @param {JQuery} muteDiv  The div containing the mute icons
 */
Sequencer.prototype.setMuteClickHandler = function (muteDiv) {

    // Ref. to self
    var self = this;

    // Click handler
    muteDiv.on('click', function (event) {

        // Mute the source
        self.source.mute == true ? self.source.mute = false : self.source.mute = true;

        // Toggle the colour class to know its active
        muteDiv.toggleClass('secondary-colour');

    });

};

/**
 * Set the track JSON object, used for the syncing/updating of tracks from
 * other clients.
 *
 * @param {object} track  JSON object of the track
 */
Sequencer.prototype.setTrackJSON = function (track) {

    // Ref to self
    var self = this;

    // Check if volume has been changed
    if (this.track.volume != track.volume) {
        // Volume has been changed, update it

        // Set the slider value
        this.volumeDOM.val(track.volume);

        // Set the volume
        this.source.volume.value = parseInt(track.volume);
    }

    // Check if sample has been changed
    if (track.bufferName != undefined
        && this.track.bufferName != track.bufferName) {
        // The sample has been changed

        // Load the sample and set the buffer
        this.source.load(this.getSamplePath(track.bufferName), function() {

            // Set the buffer
            self.setBuffer(self.source.buffer.get());

        });

    }

    // Set eq
    this.eq3.low.value = track.eqLowVal;
    this.eq3.mid.value = track.eqMidVal;
    this.eq3.high.value = track.eqHighVal;

    // Set the track json
    this.track = deepClone(track);

    // Set all the cells and their values
    this.track.pattern.map(this.setStep.bind(this));

    // Track has been initialised
    this.isInitialised = true;

};

/**
 * Get the track JSON
 *
 * @return {object} this.track  The track JSON object
 */
Sequencer.prototype.getTrackJSON = function () {
    return this.track;
};

/**
 * Set the initialised flag, used when instrument is initalised
 * fresh, without exisiting track JSON data
 */
Sequencer.prototype.setInitialised = function () {
    // Track has been initialised
    this.isInitialised = true;
};

/**
 * Set an individual step value either on or off and reflect the change
 *
 * @param {array} step  The steps value
 */
Sequencer.prototype.setStep = function (step, index) {

    // Get if it is on or off
    var on = step[0] > 0 ? true : false;

    // Set the cell value
    this.steps.setCell(index, 0, on);

};

/**
 * Get the sequencer ID
 *
 * @returns {string} id  The track id of this sequencer
 */
Sequencer.prototype.getId = function () {
    return this.track.id;
};


module.exports = Sequencer;

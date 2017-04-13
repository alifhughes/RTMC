var Tone = require('tone');
var trigger = require('../../../helpers/trigger');
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

    // Create a player and connect it to the master output (your speakers)
    this.source = new Tone.Player("../../audio/727-HM-CONGA.WAV").toMaster();

    // Set initialised flag
    this.isInitialised = false;

    // Initialse volume DOM element as false
    this.volumeDOM = false;

    // Reference to self
    var self = this;

    // Sequence notes
    this.seq = new Tone.Sequence(function(time, col) {

        // Get the array of columns from the matrix
        var column = self.steps.matrix[col];

        // Jump to the current cell to highlight the block
        self.steps.jumpToCol(col);

        // If cell has value, play the note
        if (1 === column[0]) {
            // Trigger synth to play note at the time passed in to the callback
            //trigger(self.synth, "C4", '32n');
            try {
                self.source.start();
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
            sampleURL: '../../audio/727-HM-CONGA.WAV'
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
        // Toggle the popup
        settings.popup.toggle(400);
    });

    // On click handler for the settings icon
    settings.cancelBtn.on('click', function (event) {
        // Load the sample original sample
        self.source.load(self.track.sampleURL);

        // Toggle popup
        settings.popup.toggle(400);
    });

    // On click handler for the settings icon
    settings.confirmBtn.on('click', function (event) {
        // Confirm choice of sample and push to other clients
        // Get the new sample selected
        var sample = settings.samplesList.val();

        // Append the base url
        var sampleURL = self.baseURL + sample;

        // Set it to the track
        self.track.sampleURL = sampleURL;

        // Push changes
        self.pushChanges();

        // Close the popup
        settings.popup.toggle(400);
    });

    // Select list handler for on change
    settings.samplesList.change(function (event) {

        // Get the new sample selected
        var sample = settings.samplesList.val();

        // Append the base url
        var sampleURL = self.baseURL + sample;

        // Load the sample
        self.source.load(sampleURL);

    });

};

/**
 * Set the track JSON object, used for the syncing/updating of tracks from
 * other clients.
 *
 * @param {object} track  JSON object of the track
 */
Sequencer.prototype.setTrackJSON = function (track) {

    // Check if volume has been changed
    if (this.track.volume != track.volume) {
        // Volume has been changed, update it

        // Set the slider value
        this.volumeDOM.val(track.volume);

        // Set the volume
        this.source.volume.value = parseInt(track.volume);
    }

    // Check if sample has been changed
    if (track.sampleURL != undefined
        && this.track.sampleURL != track.sampleURL) {
        // The sample has been changed

        // Load the sample
        this.source.load(track.sampleURL);

    }

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

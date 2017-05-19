var $ = require('jquery');

/**
 * Master playback control is a module usable by individual
 * instruments so that they can stop the playback of the whole
 * arrangement if needed.
 * - Mainly used for synth when the recording has stopped or 
 *   a recording has been sent
 *
 * @return {MasterPlaybackControl}
 */
var MasterPlaybackControl = function () {

    // Get the play back button
    this.playbackButton = $('#start-stop');

    // implement fluent interface
    return this;
};

/**
 * Triggers the master playback to start and removes
 * loading screen.
 *
 * @return {MasterPlaybackControl}
 */
MasterPlaybackControl.prototype.startPlayback = function () {

    // Check if it is playing
    if (this.playbackButton.hasClass('fa-stop-circle')) {
        // Track is already playing
        // Dont proceed
        return this;
    }

    // Start the play back
    this.playbackButton.click();

    // Hide the loading overlay
    $('#loadOverlay').hide();

    // Implement fluent interface
    return this;
};

/**
 * Triggers the master playback to stop and add the
 * loading screen.
 *
 * @return {MasterPlaybackControl}
 */
MasterPlaybackControl.prototype.stopPlayback = function () {

    // Check if it is not playing
    if (this.playbackButton.hasClass('fa-play-circle')) {
        // Track is already not playing, Don't proceed
        return this;
    }

    // Stop the play back
    this.playbackButton.click();

    // Show the loading overlay
    $('#loadOverlay').show();

    // Implement fluent interface
    return this;
};

/**
 * Show the loading overlay
 *
 * @return {MasterPlaybackControl}
 */
MasterPlaybackControl.prototype.showLoadingOverlay = function () {
    // Show the loading overlay
    $('#loadOverlay').show();
};

/**
 * Hide the loading overlay
 *
 * @return {MasterPlaybackControl}
 */
MasterPlaybackControl.prototype.hideLoadingOverlay = function () {
    // Show the loading overlay
    $('#loadOverlay').hide();
};

module.exports = MasterPlaybackControl;

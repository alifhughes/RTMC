// Require tone
var Tone = require('tone');

/**
 * Triggers an instrument to be played using `triggerAttackRelease` function
 * for the instrument, note and duration specified
 *
 * @param {Tone.instrument} intrument  The instrument to be triggered
 * @param {string} note                The note value to be played
 * @param {string} duration            The duration that is should be played for
 */
var trigger = function(instrument, note, duration) {
    instrument.triggerAttackRelease(note, duration);
};

module.exports = trigger;

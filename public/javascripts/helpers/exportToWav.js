var toWav = require('audiobuffer-to-wav')
var mergeBuffers = require('merge-audio-buffers');

/**
 * Layer the audio buffer channel data and conver it to wav
 *
 * @param  {array}        allAudioBuffers  An array holding all array buffers
 * @param  {AudioContext} audioContext     The audio context
 * @return {ArrayBuffer}  wav              The array buffer of the layered Audiobuffers
 */
var exportToWav = function (allAudioBuffers, audioContext) {

    // Init long buffer
    var longestBufferLength = 0;
    var layeredAudioBuffer = mergeBuffers(allAudioBuffers, audioContext);

    /*
    // Iterate the buffers
    for (var i = 0; i < allAudioBuffers.length; i++) {

        // Check if length of buffer is longer than longest so far
        if (allAudioBuffers[i].length > longestBufferLength) {
            // Is bigger, reset the longest length
            longestBufferLength = allAudioBuffers[i].length;
        }

    }

    // Create new audio buffer
    var layeredAudioBuffer = audioContext.createBuffer(allAudioBuffers.length, longestBufferLength, audioContext.sampleRate);

    // Iterate the buffers
    for (var i = 0; i < allAudioBuffers.length; i++) {
        // Copy the channel data
        layeredAudioBuffer.copyToChannel(allAudioBuffers[i].getChannelData(0), i);
    console.log(allAudioBuffers[i].getChannelData(0));
    }
    */

    // Encode the buffers to wav
    var wav = toWav(layeredAudioBuffer)

    // Return the wav
    return wav;
};

module.exports = exportToWav;

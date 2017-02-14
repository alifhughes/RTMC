window.AudioContext = window.AudioContext || window.webkitAudioContext;
context = new AudioContext();

//create a synth and connect it to the master output (your speakers)
var synth = new Tone.Synth().toMaster()

console.log(synth);

//play a middle 'C' for the duration of an 8th note
synth.triggerAttackRelease('C4', '8n')

var mongoose = require('mongoose');

module.exports = mongoose.model('Arrangement', {
    ownerId: String,
    name: String,
    contributors: [String],
    type: String,
    tracks: [],
    bpm: Number
});

var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    username: String,
    password: String,
    firstName: String,
    lastName: String
});

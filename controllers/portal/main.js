// Get the user
var User = require('../../models/user');
var Arrangement = require('../../models/arrangement');

// Render portal main page.
exports.render = function(req, res) {

    // Find the user's details logged in
    User.findById(req.user.id)
        .then(function(userDetailsDoc) {

            // Find the arrangements that this user is owner of
            Arrangement.find({ownerId: userDetailsDoc._id}, function (err, arrangementDetailsDoc) {

                    // Init tracks array
                    var tracks = [];

                    // Add track details to array
                    arrangementDetailsDoc.map(function (track) {

                        tracks.push({
                            id : track._id,
                            name: track.name,
                            bpm: track.bpm
                        });

                    });

                    // Create array to send back to view
                    res.render(
                        'portal/main',
                        {
                            title: 'Portal',
                            firstName: userDetailsDoc.firstName,
                            lastName: userDetailsDoc.lastName,
                            userTracks: tracks
                        }
                    );
                });
        });
};

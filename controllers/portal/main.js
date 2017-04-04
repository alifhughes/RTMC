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

                    // Reverse track to get newest first
                    tracks.reverse();

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

// Delete a track
exports.deleteTrack = function(req, res) {

    // Find arrangement by id
    Arrangement.findById(req.params.id, function (err, arrangement) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            arrangement.remove(function (err, arrangement) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + arrangement._id);
                    res.format({
                        //HTML returns us back to the portal
                          html: function(){
                               res.redirect("/portal");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : arrangement
                               });
                         }
                      });
                }
            });
        }
    });

};

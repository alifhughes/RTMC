var Arrangement = require('../../models/arrangement');

/**
 * Get the arrangment details and render the page
 */
exports.render = function(req, res) {

    // Get the arrangement id from url
    var arrangementId = req.params.arrangementId;

    // User registered
    var userRegistered = false;
    var userId = false;

    // Check if user is logged in
    if (req.user) {
        userRegistered = true;
        userId = req.user._id;
    }

    // Get full url for sharing
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    // Get the arrangement by the ID passed in the url
    Arrangement.findById(arrangementId, function (error, doc) {

        // Check if error finding the arrangement
        if (error) {
            res.redirect('/portal');
        }
        // Render the page with arrangement name as tab label
        res.render(
            'workstation/workstation',
            {
                title: doc.name,
                userRegistered: userRegistered,
                path: fullUrl,
                userId: userId
            }
        )
    });
};

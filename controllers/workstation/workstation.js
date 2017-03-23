var Arrangement = require('../../models/arrangement');

/**
 * Get the arrangment details and render the page
 */
exports.render = function(req, res) {

    // Get the arrangement id from url
    var arrangementId = req.params.arrangementId;

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
                title: doc.name
            }
        )
    });
};

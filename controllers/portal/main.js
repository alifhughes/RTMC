// Get the user
var User = require('../../models/user');

// Render portal main page.
exports.render = function(req, res) {

    // Find the user's details logged in
    User.findById(req.user.id)
        .then(function(doc) {
            res.render(
                'portal/main',
                {
                    title: 'Portal',
                    firstName: doc.firstName,
                    lastName: doc.lastName
                }
            );

        });
};

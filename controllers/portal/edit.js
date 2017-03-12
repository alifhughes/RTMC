// Get the user
var User = require('../../models/user');

// Render portal main page.
exports.render = function(req, res) {

    // Find the user's details logged in
    User.findById(req.user.id)
        .then(function(doc) {
            res.render(
                'portal/edit',
                {
                    title: 'Portal',
                    firstName: doc.firstName,
                    lastName: doc.lastName,
                    username: doc.username,
                    email: doc.email
                }
            );

        });
};

// Submit user details
exports.submit = function(req, res, next) {

    // Find the user's details logged in
    User.findById(req.user.id, function (err, doc) {

        if (err) {
            console.error('No entry found');
        }

        doc.firstName = req.param('firstName');
        doc.lastName = req.param('lastName');
        doc.username = req.param('username');
        doc.email = req.param('email');
        doc.save();

    });

    res.redirect('/portal');
};

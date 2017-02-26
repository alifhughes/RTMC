// Render login page.
exports.render = function(req, res) {
    // Display login page with any flash message
    res.render(
        'login',
        {
            title: 'Login'
        },
        {
            message: req.flash('message')
        }
    );
};

// Authenticate login strategy
exports.authenticate = function (passport) {
     // Passport authenticate login
     passport.authenticate(
        'login', {
            successRedirect: '/workstation',
            failureRedirect: '/',
            failureFlash: true
        }
     );
};

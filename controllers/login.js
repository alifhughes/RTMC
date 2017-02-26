// Render login page.
exports.render = function(req, res) {
    // Display login page with any flash message
    res.render(
        'login',
        {
            title: 'Login'
        }
    );
};

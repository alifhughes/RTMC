// Render portal main page.
exports.render = function(req, res) {
    res.render(
        'portal/main',
        {
            title: 'Portal'
        }
    );
};

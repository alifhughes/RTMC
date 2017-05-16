var Arrangement = require('../../models/arrangement');

exports.render = function(req, res) {
    console.log('asdasdasdas');
    res.render(
        'workstation/setup',
        {
            title: 'Project setup'
        }
    )
};

exports.create = function(req, res, next) {

    // Get the project name from the form
    var projectName = req.param('project-name');

    // init new arrangement
    var newArrangement = new Arrangement();

    // Create new db arrangement entity
    newArrangement.ownerId = req.user.id;
    newArrangement.name    = projectName;
    newArrangement.type    = 'arrangement';
    newArrangement.bpm     = 120;
    newArrangement.stepsLength = 16;

    // Save entry
    newArrangement.save(function(err) {
        if (err){
            console.log('Error in Saving arrangment: '+err);
            throw err;
        }
        console.log('New arrangement succesful');

        // Move them to the newly created workstation
        res.redirect('/workstation/arrangement/' + newArrangement._id);
   });

};

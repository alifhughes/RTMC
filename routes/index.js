var express = require('express');
var router = express.Router();
var login = require('../routes/login');
var signup = require('../routes/signup');
var workstation = require('../routes/workstation/workstation');
var signout = require('../routes/signout');
var portal = require('../routes/portal/main');

// Routes
router.use('/login', login);
router.use('/signup', signup);
router.use('/workstation', workstation);
router.use('/signout', signout);
router.use('/portal', portal);

// Homepage route
router.get('/', function(req, res, next) {
  res.render(
    'index',
    {
        title: 'Real-Time Music Collaborator',
        buttonText1: 'Login',
        buttonText2: 'Signup',
    }
  );
});


module.exports = router;

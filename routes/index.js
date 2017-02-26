var express = require('express');
var router = express.Router();
var login = require('../routes/login');
var signup = require('../routes/signup');
var workstation = require('../routes/workstation/workstation');

// Routes
router.use('/login', login);
router.use('/signup', signup);
router.use('/workstation', workstation);

// Homepage route
router.get('/', function(req, res, next) {
  res.render(
    'index',
    {
        title: 'Real-Time Music Collaborator',
        buttonText1: 'Login',
        buttonText2: 'Start Creating',
    }
  );
});


module.exports = router;

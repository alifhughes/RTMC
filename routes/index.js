var express = require('express');
var router = express.Router();
var passport = require('passport');
var login = require('../routes/login');
var workstation = require('../routes/workstation/workstation');

// Routes
router.use('/login', login);
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

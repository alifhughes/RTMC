var express = require('express');
var router = express.Router();
var signup = require('../controllers/signup');
var passport = require('passport');

/**
 * GET request, render page
 */
router.get('/', signup.render);

/* Handle Registration POST */
router.post('/', passport.authenticate('signup', {
    successRedirect: '/portal',
    failureRedirect: '/',
    failureFlash : true
}));

module.exports = router;

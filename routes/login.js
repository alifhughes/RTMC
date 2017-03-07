var express = require('express');
var router = express.Router();
var login = require('../controllers/login');
var passport = require('passport');

/**
 * GET request, render page
 */
router.get('/', login.render);

/**
 * Get post variables from login page
 */
router.post('/', passport.authenticate('login', {
        successRedirect: '/portal',
        failureRedirect: '/',
        failureFlash : true
    })
);

module.exports = router;

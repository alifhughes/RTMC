var express = require('express');
var router = express.Router();
var signup = require('../controllers/signup');

/**
 * GET request, render page
 */
router.get('/', signup.render);

/**
 * Get post variables from login page
 */
router.post('/', function (req, res, next) {
    console.log(req.body.username);
    console.log(req.body.password);
    res.redirect('workstation');
});

/**
 * Get post variables from login page
 */
//router.post('/', login.authenticate(passport));

module.exports = router;

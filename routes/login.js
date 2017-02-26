var express = require('express');
var router = express.Router();
var login = require('../controllers/login');

/**
 * GET request, render page
 */
router.get('/', login.render);


/**
 * Get post variables from login page
 */
//router.post('/', login.authenticate(passport));

module.exports = router;

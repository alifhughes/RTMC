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
router.post('/', function (req, res, next) {
    console.log(req.body.username);
    console.log(req.body.password);
    res.redirect('workstation');
});

module.exports = router;

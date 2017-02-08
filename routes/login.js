var express = require('express');
var router = express.Router();
var login = require('../controllers/login');

/**
 * GET page variables from controller
 */
router.get('/', login.pageVariables);

/**
 * Get post variables from login page
 */
router.post('/', function (req, res, next) {
    console.log(req.body.username);
    console.log(req.body.password);
    res.send('Post page');
});

module.exports = router;

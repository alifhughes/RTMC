var express = require('express');
var router = express.Router();
var main = require('../../controllers/portal/main');

/**
 * GET request, render page
 */
router.get('/', main.render);

module.exports = router;

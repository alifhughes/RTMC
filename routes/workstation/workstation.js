var express = require('express');
var router = express.Router();
var workstation = require('../../controllers/workstation/workstation');

/**
 * GET request to render page
 */
router.get('/', workstation.render);

module.exports = router;

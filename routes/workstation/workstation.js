var express = require('express');
var router = express.Router();
var workstation = require('../../controllers/workstation/workstation');
var setup = require('../../controllers/workstation/setup');

/**
 * GET request to render page
 */
router.get('/arrangement/:arrangementId', workstation.render);

/**
 * GET request to render page
 */
router.get('/setup', setup.render);

/**
 * GET request to render page
 */
router.post('/setup', setup.create);

module.exports = router;

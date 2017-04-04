var express = require('express');
var router = express.Router();
var main = require('../../controllers/portal/main');
var edit = require('../../controllers/portal/edit');

/**
 * GET request, render page
 */
router.get('/', main.render);

/**
 * GET request, render edit page
 */
router.get('/edit', edit.render);

/**
 * POST request, submit edit user details
 */
router.post('/edit', edit.submit);

/**
 * POST request, submit edit user details
 */
router.post('/:id/delete', main.deleteTrack);

module.exports = router;

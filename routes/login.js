var express = require('express');
var login = require('../controllers/login');
var router = express.Router();

/* GET home page. */
router.get('/', login.pageVariables);

module.exports = router;

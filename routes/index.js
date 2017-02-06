var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(
    'index',
    {
        title: 'Real-Time Music Collaborator',
        buttonText1: 'Login',
        buttonText2: 'Start Creating',
    }
  );
});

module.exports = router;

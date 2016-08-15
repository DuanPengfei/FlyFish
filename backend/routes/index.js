var express = require('express');
var router = express.Router();

var config = require('../config/index');

// page
router.get('/', function(req, res, next) {
  return res.render('index', {
    'title': config.language.INDEX,
    'user': req.session.user,
    'error': req.flash('error').toString(),
    'success': req.flash('success').toString()
  });
});

router.get('/internal_error', function(req, res, next) {
  res.render('internal_error', {
    'title': config.language.INTERNAL_ERROR,
    'user': req.session.user,
    'error': req.flash('error').toString(),
    'success': req.flash('success').toString()
  })
});

module.exports = router;

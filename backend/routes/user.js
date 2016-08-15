var express = require('express');
var router = express.Router();

var config = require('../config/index');

var userController = require('../controllers/user.js');

// user
router.get('/register', function(req, res, next) {
  return res.render('user/register', {
    'title': config.language.REGISTER,
    'user': req.session.user,
    'error': req.flash('error').toString(),
    'success': req.flash('success').toString()
  });
});
router.post('/register', userController.register);

router.get('/login', function(req, res, next) {
  return res.render('user/login', {
    'title': config.language.LOGIN,
    'user': req.session.user,
    'error': req.flash('error').toString(),
    'success': req.flash('success').toString()
  });
});
router.post('/login', userController.login);

router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.redirect('/');
});

module.exports = router;

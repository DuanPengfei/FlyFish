'use strict';

var crypto = require('crypto');

var config = require('../config/index.js');

var User = require('../models/user.js');

module.exports = {
  'register': function(req, res, next) {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var passwordRepeat = req.body['password-repeat'];

    if (!(email && username && password && passwordRepeat)) {
      req.flash('error', '注册信息不完整');
      return res.redirect('/user/register');
    }

    if (passwordRepeat != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/user/register');
    }
    password = crypto.createHash('md5').update(password + config.SECRET).digest('hex');

    var newUser = {
      'email': email,
      'username': username,
      'password': password,
      'confirmed': 0
    };
    User.getByEmail(email, function(error, user) {
      if (error) {
        return res.redirect('/internal_error');
      }
      if (user) {
        req.flash('error', '邮箱已被注册');
        return res.redirect('/user/register');
      }
      User.insert(newUser, function(error, user) {
        if (error) {
          return res.redirect('/internal_error');
        }
        req.session.user = user;
        req.flash('success', '注册成功');
        res.redirect('/');
      })
    })
  }, // end register

  'login': function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    password = crypto.createHash('md5').update(password + config.SECRET).digest('hex');

    User.getByEmail(email, function(error, user) {
      if (error) {
        return res.redirect('/internal_error');
      }
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/user/login');
      }

      if (user.password != password) {
        req.flash('error', '邮箱或密码错误');
        return res.redirect('/user/login')
      }
      req.session.user = user;
      if (req.session.originalUrl) {
        var redirectUrl = req.session.originalUrl;
        req.session.originalUrl = null;
      } else {
        var redirectUrl = '/';
      }
      res.redirect(redirectUrl);
    })
  }, // end login

  'charge': function (req, res, next) {
    // todo
  }, // end charge
};

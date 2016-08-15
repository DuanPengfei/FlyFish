var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MongoStroe = require('connect-mongo')(session);
var flash = require('connect-flash');

var config = require('./config/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// flash
app.use(flash());
// session
app.use(session({
  'secret': config.SECRET,
  'key': 'dockerci',
  'cookie': {
    'maxAge': 1000 * 60 * 60 * 24 * 30
  },
  'store': new MongoStroe({
    'db': 'dockerci',
    'host': 'mongodb',
    'port': 27017
  })
}));

// 登录拦截
app.use(function (req, res, next) {
  if (req.session.user) {  // 判断用户是否登录
    next();
  } else {
    // 解析用户请求的路径
    var arr = req.url.split('/');
    // 去除 GET 请求路径上携带的参数
    for (var i = 0, length = arr.length; i < length; i++) {
      arr[i] = arr[i].split('?')[0];
    }
    // 判断请求路径是否为根、登录、注册、登出、webhook，如果是不做拦截
    if (arr.length > 1 && (arr[1] == '' || arr[1] == 'webhook')) {
      next();
    } else if (arr.length > 2 && arr[1] == 'user' && (arr[2] == 'register' || arr[2] == 'login' || arr[2] == 'logout')) {
      next();
    } else {  // 登录拦截
      req.session.originalUrl = req.originalUrl ? req.originalUrl : null;  // 记录用户原始请求路径
      req.flash('error', '请先登录');
      res.redirect('/user/login');  // 将用户重定向到登录页面
    }
  }
});

// routes
var indexRoute = require('./routes/index.js');
app.use('/', indexRoute);

var userRoute = require('./routes/user.js');
app.use('/user', userRoute);

var containerRoute = require('./routes/container.js');
app.use('/container', containerRoute);

var imageRoute = require('./routes/image.js');
app.use('/image', imageRoute);

var webhookRoute = require('./routes/webhook.js');
app.use('/webhook', webhookRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

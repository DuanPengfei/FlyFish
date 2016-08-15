'use strict';

var config = require('../config/index.js');

var imageApi = require('../apis/image.js');

module.exports = {
  'getImages': function (req, res, next) {
    imageApi.getImages(function (error, images) {
      if (error) {
        console.error(error);
        return res.redirect('/internal_error');
      }

      var formatImages = [];
      for (var i = 0, length = images.length; i < length; i++) {
        // timestamp to date
        var date = new Date(images[i].Created * 1000);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var sec = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        var created = year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec;

        var tmpArr = images[i].RepoTags[0].split(':');
        var image = {
          'Id': images[i].Id,
          'name': tmpArr[0],
          'version': tmpArr[1],
          'size': (images[i].VirtualSize / 1000000).toFixed(1) + ' M',
          'created': created
        };

        formatImages.push(image);
      }

      res.render('image/downloaded', {
        'title': config.language.DOWNLOADEDIMAGE,
        'user': req.session.user,
        'error': req.flash('error').toString(),
        'success': req.flash('success').toString(),

        'images': formatImages
      })
    });
  }
};

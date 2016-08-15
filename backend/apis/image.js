var config = require('../config/index.js');

var request = require('request');

var baseUrl = 'http://' + config.docker.api.ip + ':' + config.docker.api.port;

module.exports = {
  'getImages': function (callback) {
    request({
      'url': baseUrl + '/images/json',
      'method': 'GET'
    }, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      if (response.statusCode == 200) {
        return callback(null, JSON.parse(body));
      } else {
        return callback(response.statusCode);
      }
    });
  }
};

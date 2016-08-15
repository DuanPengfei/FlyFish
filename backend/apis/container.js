var config = require('../config/index.js');

var request = require('request');

var baseUrl = 'http://' + config.docker.api.ip + ':' + config.docker.api.port;

module.exports = {
  'getContainerInfo': function (Id, callback) {
    request({
      'url': baseUrl + '/containers/' + Id + '/json',
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
  },

  'getContainers': function (callback) {
    request({
      'url': baseUrl + '/containers/json?all=1',
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
  },

  'createContainer': function (containerName, containerInfo, callback) {
    var options = {
      'url': baseUrl + '/containers/create?name=' + containerName,
      'method': 'POST',
      'json': containerInfo
    };
    request(options, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      if (response.statusCode == 201) {
        callback(null, body);
      } else {
        return callback(response.statusCode);
      }
    });
  },

  'startContainer': function (Id, callback) {
    var options = {
      'url': baseUrl + '/containers/' + Id + '/start',
      'method': 'POST'
    };
    request(options, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      if (response.statusCode == 204) {
        callback(null, body);
      } else {
        return callback(response.statusCode);
      }
    });
  },

  'reStartContainer': function (Id, callback) {
    var options = {
      'url': baseUrl + '/containers/' + Id + '/restart',
      'method': 'POST'
    };
    request(options, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      if (response.statusCode == 204) {
        callback(null, body);
      } else {
        return callback(response.statusCode);
      }
    });
  },

  'stopContainer': function (Id, callback) {
    var options = {
      'url': baseUrl + '/containers/' + Id + '/stop',
      'method': 'POST'
    };
    request(options, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      if (response.statusCode == 204) {
        callback(null, body);
      } else {
        return callback(response.statusCode);
      }
    });
  },

  'removeContainer': function (Id, callback) {
    var options = {
      'url': baseUrl + '/containers/' + Id,
      'method': 'DELETE'
    };
    request(options, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      if (response.statusCode == 204) {
        callback(null, body);
      } else {
        return callback(response.statusCode);
      }
    });
  }
};

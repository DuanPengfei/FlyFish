'use strict';

var exec = require('child_process').exec;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var config = require('../config/index.js');

var Container = {};

MongoClient.connect(config.mongodb.url, function(error, db) {
  var collection = db.collection('containers');

  Container.getByUserId = function (userId, callback) {
    var query = {
      'user_id': userId
    };
    collection.find(query).toArray(function (error, containers) {
      if (error) {
        return callback(error);
      }
      callback(null, containers);
    });
  };

  Container.getByName = function(containerName, callback) {
    collection.findOne({
      'name': containerName
    }, function(error, container) {
      if (error) {
        return callback(error);
      }
      callback(null, container);
    });
  };

  Container.getByUrl = function(containerUrl, callback) {
    collection.findOne({
      'url': containerUrl
    }, function(error, container) {
      if (error) {
        return callback(error);
      }
      callback(null, container);
    });
  };

  Container.insert = function(containerInfo, callback) {
    collection.insertOne(containerInfo, function(error, container) {
      if (error) {
        return callback(error);
      }
      callback(null, container.ops[0]);
    });
  };

  Container.insertIdFromApiToMongodb = function (id, Id, callback) {
    // query, sort, doc, options, callback
    collection.findAndModify({
        '_id': new ObjectID(id)
      }, [
        ['port', 1]
      ], {
        '$set': { 'Id': Id }
      }, {
        'new': true
      }, function (error, doc) {
      if (error) {
        return callback(error);
      }
      callback(null, doc.value);
    })
  };
});

module.exports = Container;

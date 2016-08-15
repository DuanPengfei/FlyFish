'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var config = require('../config/index.js');

function User(email, username, password) {
  this.email = email;
  this.username = username;
  this.password = password;
}

MongoClient.connect(config.mongodb.url, function(error, db) {
  if (error) {
    console.log('connect to mongodb error');
    process.exit(1);
  }

  var collection = db.collection('users');

  User.insert = function(user, callback) {
    collection.insertOne(user, function(error, user) {
      if (error) {
        return callback(error);
      }
      callback(null, user.ops[0]);
    })
  };

  User.getByEmail = function(email, callback) {
    collection.findOne({
      'email': email
    }, function(error, user) {
      if (error) {
        return callback(error);
      }
      callback(null, user)
    });
  };

  User.getById = function(userId, callback) {
    collection.findOne({
      '_id': new ObjectID(userId)
    }, function(error, user) {
      if (error) {
        return callback(error);
      }
      callback(null, user)
    });
  };
});

module.exports = User;

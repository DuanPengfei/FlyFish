var express = require('express');
var router = express.Router();

var config = require('../config/index');

var imageController = require('../controllers/image.js');

// image
router.get('/', imageController.getImages);

module.exports = router;

var express = require('express');
var router = express.Router();

var config = require('../config/index');

var webhookController = require('../controllers/webhook.js');

// webhook
router.post('/container/:containerName', webhookController.createContainer);

module.exports = router;

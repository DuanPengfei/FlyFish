var express = require('express');
var router = express.Router();

var config = require('../config/index');

var containerController = require('../controllers/container.js');

// container
router.get('/', containerController.getRunningContainers);

router.get('/create', containerController.createContainer);
router.post('/create', containerController.createContainer);

router.get('/:containerId', containerController.getContainerInfo);

router.post('/restart/:containerId', containerController.restartContainer);
router.post('/stop/:containerId', containerController.stopContainer);
router.post('/start/:containerId', containerController.startContainer);

router.get('/user/:userId', containerController.getCreatedContainers);

module.exports = router;

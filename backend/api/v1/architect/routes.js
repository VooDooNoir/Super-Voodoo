const express = require('express');
const router = express.Router();
const architectController = require('./controller');

router.post('/scrape', architectController.scrape);
router.post('/generate', architectController.generate);
router.post('/deploy', architectController.deploy);

module.exports = router;

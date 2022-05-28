const express = require('express');

const controller = require('./controller/index');

const router = express.Router();

router.post('/fromTwitter', (req, res) => {
  controller.fromTwitter(res, req.body);
});

module.exports = router;

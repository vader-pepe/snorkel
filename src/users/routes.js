const express = require('express');

const controller = require('./controller/index');
const schemas = require('./utils/schemasValidation');

const router = express.Router();

router.post(
  '/api/v1/signup',
  (req, res) => {
    controller.signUp(res, req.body);
  }
);

module.exports = router;

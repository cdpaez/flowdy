const express = require('express');
const router = express.Router();

const {
  getEstadosPedidos
} = require('../controllers/estadosPedido.controller');

router.get('/', getEstadosPedidos);

module.exports = router;
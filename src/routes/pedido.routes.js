const express = require('express');
const router = express.Router();

const {
  getPedidos,
  getPedidoById,
  crearPedido,
  eliminarPedido
} = require('../controllers/pedido.controller');

// GET todos
router.get('/', getPedidos);

// GET uno
router.get('/:id', getPedidoById);

// POST crear pedido
router.post('/', crearPedido);

// DELETE
router.delete('/:id', eliminarPedido);

module.exports = router;
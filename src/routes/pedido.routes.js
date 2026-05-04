const express = require('express');
const router = express.Router();

const {
  obtenerPedidoPorId,
  crearPedido,
  obtenerHistorialPedidos,
  corregirCedulaPedido,
  eliminarPedido,
  actualizarEstadoPedido
} = require('../controllers/pedido.controller');

// POST crear pedido
router.post('/', crearPedido);

// GET todos
router.get('/', obtenerHistorialPedidos);

// PUT actualizar estado
router.put('/:id/estado', actualizarEstadoPedido);

// GET uno
router.get('/:id', obtenerPedidoPorId);

// DELETE
router.delete('/:id', eliminarPedido);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/producto.controller');

// GET todos
router.get('/', getProductos);

// GET uno
router.get('/:id', getProductoById);

// POST crear producto
router.post('/', crearProducto);

// PUT actualizar producto
router.put('/:id', actualizarProducto);

// DELETE eliminar producto
router.delete('/:id', eliminarProducto);

module.exports = router;
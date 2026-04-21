const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');

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
router.post('/', upload.single('imagen'),crearProducto);

// PUT actualizar producto
router.put('/:id',upload.single('imagen'), actualizarProducto);

// DELETE eliminar producto
router.delete('/:id', eliminarProducto);

module.exports = router;
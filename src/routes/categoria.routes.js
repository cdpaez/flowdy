const express = require('express');
const router = express.Router();

const {
  crearCategoria,
  getCategorias,
  getCategoriaById,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoria.controller');

// Crear categoría
router.post('/', crearCategoria);

// Obtener todas
router.get('/', getCategorias);

// Obtener por ID
router.get('/:id', getCategoriaById);

// Actualizar
router.put('/:id', actualizarCategoria);

// Eliminar
router.delete('/:id', eliminarCategoria);

module.exports = router;
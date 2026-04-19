const express = require('express');
const router = express.Router();
const {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstado
  
} = require('../controllers/dashboard/usuario.controller');

router.post('/crear', crearUsuario);
router.get('/obtener', obtenerUsuarios);
router.get('/obtener/:id', obtenerUsuarioPorId);
router.put('/actualizar/:id', actualizarUsuario);
router.patch('/cambiar-estado/:id', cambiarEstado);
router.delete('/eliminar/:id', eliminarUsuario);

module.exports = router;

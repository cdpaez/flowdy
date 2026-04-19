const { Usuario } = require('../../database/models');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { forceDisconnect } = require('../../services/websocket');

const crearUsuario = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash de la contraseña
    const nuevoUsuario = await Usuario.create({ ...rest, password: hashedPassword });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuario', error });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const { password, ...rest } = req.body;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await usuario.update({ ...rest, password: hashedPassword });
    } else {
      await usuario.update(rest);
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await usuario.destroy();
    res.status(200).json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error });
  }
};

// Controlador para cambiar estado y forzar desconexion
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // 1. Validar estado
    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        mensaje: 'Estado inválido. Use "activo" o "inactivo"'
      });
    }

    // 2. Buscar usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // 3. Actualizar estado en BD
    await usuario.update({ estado });

    // 4. si el estado es inactivo forzamos la desconexion
    if (estado === 'inactivo') {
      forceDisconnect(usuario.id); // Llamada a la función WebSocket
    }

    // 5. Respuesta exitosa
    res.json(
      {
        success: true,
        usuario,
        mensaje: `Estado cambiado a ${estado}` +
          (estado === 'inactivo' ? '(usuario desconectado)' : '')
      }
    );

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno al cambiar estado'
    });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstado
};

const { Usuario } = require('../database/models');
const jwt = require('jsonwebtoken')
const { mapperUserLogin } = require('../mappers/usuario.mapper');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) { // ✅ Valida que existan los campos
    return res.status(400).json({ mensaje: 'Faltan correo o contraseña' });
  }

  try {
    const usuario = await Usuario.findOne(
      {
        where: { correo }
      });

    if (!usuario) {
      return res.status(404).json(
        {
          mensaje: 'No encontramos tu cuenta'
        });
    }

    // Agrega esta validación:
    if (usuario.estado === 'inactivo') {
      return res.status(403).json({ mensaje: 'Tu cuenta está desactivada.' });
    }

    // Compara la contraseña ingresada con el hash almacenado
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(401).json({ mensaje: 'Datos Incorrectos' });
    }

    // aqui es cuando se mapea el como se obtiene los datos de la peticion GET
    const userMapped = mapperUserLogin(usuario);

    // Generamos el token JWT (podemos incluir el id y rol si es necesario)
    const token = jwt.sign(
      {
        id: userMapped.id,
        rol: userMapped.rol
      },
      process.env.JWT_SECRET, // Clave desde entorno
      {
        expiresIn: process.env.JWT_EXPIRES_IN // '1h' desde entorno
      }
    );

    // determinar la ruta de redirecion basada en roles
    let redirectPath = 'pages/dashboard.html'; // Valor por defecto
    if (userMapped.rol === 'vendedor') {
      redirectPath = 'pages/operador.html'; // Redirigir a la página de operador si el rol es operador
    }
    // Usuario encontrado
    res.status(200).json(
      {
        mensaje: 'Login exitoso',
        token,
        rol: userMapped.rol,
        id: userMapped.id,
        redirect: redirectPath
      });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json(
      {
        mensaje: 'Error del servidor'
      });
  }
};

module.exports = { login };
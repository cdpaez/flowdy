function mapperUserLogin(userRaw) {
  return {
    id: userRaw.id,
    correo: userRaw.correo,
    rol: userRaw.rol_usuario
  };
}
module.exports = { mapperUserLogin };
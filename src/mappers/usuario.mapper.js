function mapperUserLogin(userRaw) {
  return {
    id: userRaw.id,
    email: userRaw.email,
    rol: userRaw.rol
  };
}
module.exports = { mapperUserLogin };
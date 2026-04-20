//archivos encargado de la infraestructura (DB, server, sockets)
const globalConstants = require('./const/globalConstants')
// server.js
const app = require('./app');
const { sequelize } = require('./database/models');
const PORT = globalConstants.PORT;
const { setupWebSocket } = require('./services/websocket');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    await sequelize.sync();
    console.log('📦 Tablas sincronizadas');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });

    setupWebSocket(server); // Integra WS con tu servidor HTTP


  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
})();
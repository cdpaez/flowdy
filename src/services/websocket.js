const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// Mapa para almacenar conexiones: { userId: Set<WebSocket> }
const activeConnections = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {

    const token = new URL(
      req.url,
      `ws://${req.headers.host}`
    ).searchParams.get('token');

    // 🔐 ADMIN AUTENTICADO
    if (token) {

      try {

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        const userId = decoded.id;

        if (!activeConnections.has(userId)) {
          activeConnections.set(userId, new Set());
        }

        activeConnections.get(userId).add(ws);

        ws.send(JSON.stringify({
          type: 'connection_established'
        }));

        ws.on('close', () => {
          activeConnections.get(userId)?.delete(ws);

          if (
            activeConnections.get(userId)?.size === 0
          ) {
            activeConnections.delete(userId);
          }
        });

      } catch (error) {

        console.error(
          'Conexión WS no autorizada:',
          error
        );

        ws.close(4001, 'Autenticación fallida');
      }

    } else {

      // 🌍 LANDING PÚBLICA
      if (!activeConnections.has('public')) {
        activeConnections.set('public', new Set());
      }

      activeConnections.get('public').add(ws);

      ws.send(JSON.stringify({
        type: 'connection_established'
      }));

      ws.on('close', () => {
        activeConnections.get('public')?.delete(ws);

        if (
          activeConnections.get('public')?.size === 0
        ) {
          activeConnections.delete('public');
        }
      });
    }
  });
}

// 🔌 Emitir evento global a todos los clientes conectados
function emitEventoGlobal(type, data) {
  activeConnections.forEach((sockets) => {
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, payload: data }));
      }
    });
  });
}

function forceDisconnect(userId) {
  if (activeConnections.has(userId)) {
    activeConnections.get(userId).forEach(ws => {
      try {
        // Enviar mensaje explícito antes de cerrar
        ws.send(JSON.stringify({ type: 'forced_logout' }));
      } catch (err) {
        console.warn(`Error al enviar mensaje de logout al usuario ${userId}`, err);
      }

      // Luego cerrar conexión
      ws.close(4003, 'Usuario desactivado');
    });

    activeConnections.delete(userId);
  }
}

module.exports = { setupWebSocket, forceDisconnect, emitEventoGlobal };

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por IP
  message: {
    error: "Demasiadas solicitudes. Intente nuevamente más tarde."
  },
  standardHeaders: true,
  legacyHeaders: false
});

const pedidoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: "Demasiados intentos de pedido. Espere unos minutos."
  }
});

module.exports = {
  apiLimiter,
  pedidoLimiter
};
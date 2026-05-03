const express = require("express");
const router = express.Router();
const { obtenerPedidosPorEstado, obtenerStockPorProducto, obtenerIngresosMensuales} = require("../controllers/estadisticas.controller");

// 📊 Pedidos por estado (ya existente)
router.get("/pedidos", obtenerPedidosPorEstado);

// 💻 Stock por producto (nuevo)
router.get("/stock-productos", obtenerStockPorProducto);

// 💰 Ingresos mensuales (nuevo)
router.get("/ingresos-mensuales", obtenerIngresosMensuales);

module.exports = router;
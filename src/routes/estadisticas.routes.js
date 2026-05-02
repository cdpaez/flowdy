const express = require("express");
const router = express.Router();
const estadisticasController = require("../controllers/estadisticas.controller");

// 📊 Pedidos por estado (ya existente)
router.get("/pedidos-semana", estadisticasController.obtenerPedidosPorEstado);

// 💻 Stock por producto (nuevo)
router.get("/stock-productos", estadisticasController.obtenerStockPorProducto);


module.exports = router;
const db = require("../database/models");
const { Op } = db.Sequelize;

const Producto = db.Producto;

const Pedido = db.Pedido;
const EstadoPedido = db.EstadoPedido;

const obtenerPedidosPorEstado = async (req, res) => {
    try {

        const { desde, hasta } = req.query;

        /*
        =========================================================
        CONSTRUCCION CONDICIONAL DEL FILTRO
        =========================================================
        */
        const where = {};

        if (desde && hasta) {
            const inicio = new Date(desde);
            const fin = new Date(hasta);
            fin.setHours(23, 59, 59, 999);

            where.fecha = {
                [Op.between]: [inicio, fin]
            };
        }

        /*
        =========================================================
        CONSULTA
        =========================================================
        */
        const resultado = await Pedido.findAll({
            attributes: [
                'estado_id',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('Pedido.id')), 'total']
            ],
            where,
            include: [{
                model: EstadoPedido,
                as: 'estado',
                attributes: ['nombre']
            }],
            group: ['estado_id', 'estado.id']
        });

        /*
        =========================================================
        NORMALIZACION
        =========================================================
        */
        const estadisticas = {
            pendiente: 0,
            hecho: 0,
            entregado: 0
        };

        resultado.forEach(item => {
            const estado = item.estado?.nombre;
            const total = parseInt(item.dataValues.total, 10) || 0;

            if (estado === "pendiente") estadisticas.pendiente = total;
            else if (estado === "hecho") estadisticas.hecho = total;
            else if (estado === "entregado") estadisticas.entregado = total;
        });

        res.json({
            estadisticas,
            filtro: (desde && hasta) ? { desde, hasta } : null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
};

const obtenerStockPorProducto = async (req, res) => {
    try {

        const productos = await Producto.findAll({
            attributes: ['nombre', 'stock'],
            where: {
                activo: true
            },
            order: [['stock', 'DESC']]
        });

        const labels = productos.map(p => p.nombre);
        const data = productos.map(p => parseInt(p.stock));

        res.json({
            labels,
            data
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener stock por producto"
        });

    }
};

const obtenerIngresosMensuales = async (req, res) => {
    try {

        const ingresos = await Pedido.findAll({
            attributes: [
                [db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM'), 'mes'],
                [db.Sequelize.fn('SUM', db.Sequelize.col('total')), 'ingresos']
            ],
            where: {
                fecha: {
                    [Op.ne]: null
                }
            },
            group: [
                db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM')
            ],
            order: [
                [db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM'), 'ASC']
            ]
        });

        const labels = ingresos.map(i => i.dataValues.mes);
        const data = ingresos.map(i => parseFloat(i.dataValues.ingresos || 0));

        res.json({
            labels,
            data
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener ingresos mensuales"
        });

    }
};

module.exports = {
    obtenerPedidosPorEstado,
    obtenerStockPorProducto,
    obtenerIngresosMensuales
};
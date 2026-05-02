const db = require("../database/models");
const { Op } = db.Sequelize;

const Producto = db.Producto;

const Pedido = db.Pedido;
const EstadoPedido = db.EstadoPedido;

const obtenerPedidosPorEstado = async (req, res) => {
    try {

        const hoy = new Date();

        const dia = hoy.getDay();
        const diffLunes = hoy.getDate() - dia + (dia === 0 ? -6 : 1);

        const lunes = new Date(hoy.setDate(diffLunes));
        lunes.setHours(0, 0, 0, 0);

        const jueves = new Date(lunes);
        jueves.setDate(lunes.getDate() + 3);
        jueves.setHours(23, 59, 59, 999);

        const resultado = await Pedido.findAll({
            attributes: [
                'estado_id',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('Pedido.id')), 'total']
            ],
            where: {
                fecha: {
                    [Op.between]: [lunes, jueves]
                }
            },
            include: [
                {
                    model: EstadoPedido,
                    as: 'estado',
                    attributes: ['nombre']
                }
            ],
            group: ['estado_id', 'estado.id']
        });

        const estadisticas = {
            pendiente: 0,
            hecho: 0,
            entregado: 0
        };

        resultado.forEach(item => {
            const estado = item.estado.nombre;
            const total = parseInt(item.dataValues.total);

            if (estado === "pendiente") estadisticas.pendiente = total;
            if (estado === "hecho") estadisticas.hecho = total;
            if (estado === "entregado") estadisticas.entregado = total;
        });

        res.json(estadisticas);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al obtener pedidos por estado"
        });

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

module.exports = {
    obtenerPedidosPorEstado,
    obtenerStockPorProducto
};
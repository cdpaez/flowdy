const db = require("../database/models");
const { Op } = db.Sequelize;

const Producto = db.Producto;

const Pedido = db.Pedido;
const EstadoPedido = db.EstadoPedido;

const obtenerPedidosPorEstado = async (req, res) => {
    try {
        const { desde, hasta, año } = req.query;

        // Construir filtro de fecha
        let whereFecha = {};

        if (desde && hasta) {
            // Filtro por rango de fechas específico
            whereFecha = {
                [Op.gte]: db.Sequelize.literal(`'${desde} 00:00:00-05'::timestamptz`),
                [Op.lte]: db.Sequelize.literal(`'${hasta} 23:59:59.999-05'::timestamptz`)
            };
        } else if (año) {
            // Filtro por año completo
            whereFecha = {
                [Op.gte]: db.Sequelize.literal(`'${año}-01-01 00:00:00-05'`),
                [Op.lte]: db.Sequelize.literal(`'${año}-12-31 23:59:59.999-05'`)
            };
        } else {
            // Por defecto: año actual
            const añoActual = new Date().getFullYear();
            whereFecha = {
                [Op.gte]: db.Sequelize.literal(`'${añoActual}-01-01 00:00:00-05'`),
                [Op.lte]: db.Sequelize.literal(`'${añoActual}-12-31 23:59:59.999-05'`)
            };
        }

        // Consulta agrupada por mes y estado
        const resultado = await Pedido.findAll({
            attributes: [
                [db.Sequelize.fn('EXTRACT', db.Sequelize.literal('MONTH FROM fecha')), 'mes'],
                [db.Sequelize.fn('EXTRACT', db.Sequelize.literal('YEAR FROM fecha')), 'año'],
                'estado_id',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('Pedido.id')), 'total']
            ],
            include: [{
                model: db.EstadoPedido,
                as: 'estado',
                attributes: ['nombre', 'color']
            }],
            where: { fecha: whereFecha },
            group: ['mes', 'año', 'estado_id', 'estado.id', 'estado.nombre', 'estado.color'],
            order: [[db.Sequelize.literal('mes'), 'ASC']]
        });

        // Obtener todos los estados disponibles
        const estadosDisponibles = await db.EstadoPedido.findAll({
            attributes: ['id', 'nombre', 'color'],
            order: [['id', 'ASC']]
        });

        // Inicializar estructura
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const dataPorEstado = {};
        estadosDisponibles.forEach(estado => {
            dataPorEstado[estado.nombre] = Array(12).fill(0);
        });

        // Llenar datos
        resultado.forEach(item => {
            const mes = parseInt(item.dataValues.mes, 10) - 1;
            const total = parseInt(item.dataValues.total, 10);
            const nombreEstado = item.estado?.nombre;

            if (nombreEstado && dataPorEstado[nombreEstado]) {
                dataPorEstado[nombreEstado][mes] += total;
            }
        });

        // Construir datasets
        const datasets = estadosDisponibles.map(estado => ({
            label: estado.nombre,
            data: dataPorEstado[estado.nombre],
            backgroundColor: estado.color || getColorPorEstado(estado.nombre),
            borderWidth: 1
        }));

        // Determinar título
        let titulo = '';
        if (desde && hasta) {
            titulo = `Pedidos por estado - ${desde} al ${hasta}`;
        } else {
            const añoMostrar = año || new Date().getFullYear();
            titulo = `Pedidos por mes y estado - ${añoMostrar}`;
        }

        res.json({
            titulo: titulo,
            labels: meses,
            datasets: datasets,
            filtrosActivos: { desde, hasta, año }
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

// const obtenerIngresosMensuales = async (req, res) => {
//     try {

//         const ingresos = await Pedido.findAll({
//             attributes: [
//                 [db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM'), 'mes'],
//                 [db.Sequelize.fn('SUM', db.Sequelize.col('total')), 'ingresos']
//             ],
//             where: {
//                 fecha: {
//                     [Op.ne]: null
//                 }
//             },
//             group: [
//                 db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM')
//             ],
//             order: [
//                 [db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM'), 'ASC']
//             ]
//         });

//         const labels = ingresos.map(i => i.dataValues.mes);
//         const data = ingresos.map(i => parseFloat(i.dataValues.ingresos || 0));

//         res.json({
//             labels,
//             data
//         });

//     } catch (error) {

//         console.error(error);

//         res.status(500).json({
//             error: "Error al obtener ingresos mensuales"
//         });

//     }
// };
const obtenerIngresosMensuales = async (req, res) => {
    try {

        const { desde, hasta } = req.query;

        const where = {
            fecha: {
                [Op.ne]: null
            }
        };

        if (desde && hasta) {
            where.fecha = {
                [Op.between]: [desde, hasta]
            };
        } else if (desde) {
            where.fecha = {
                [Op.gte]: desde
            };
        } else if (hasta) {
            where.fecha = {
                [Op.lte]: hasta
            };
        }

        const ingresos = await Pedido.findAll({
            attributes: [
                [db.Sequelize.fn('TO_CHAR', db.Sequelize.col('fecha'), 'YYYY-MM'), 'mes'],
                [db.Sequelize.fn('SUM', db.Sequelize.col('total')), 'ingresos']
            ],
            where,
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
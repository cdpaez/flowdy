const db = require('../database/models');
const { Pedido, DetallePedido, Producto, Cliente } = db;

const crearPedido = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { cliente, pedido, detalles } = req.body;

    // 1. Crear cliente
    const nuevoCliente = await Cliente.create({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: cliente.direccion
    }, { transaction: t });

    // 2. Crear pedido
    const nuevoPedido = await Pedido.create({
      cliente_id: nuevoCliente.id,
      tipo_entrega: pedido.tipo_entrega,
      direccion_entrega: pedido.direccion_entrega,
      forma_pago: pedido.forma_pago,
      fecha_pedido: new Date(),
      fecha_entrega: new Date(),
      estado: 'pendiente'
    }, { transaction: t });

    // 3. Crear detalles
    for (const item of detalles) {
      const producto = await Producto.findByPk(item.producto_id);

      if (!producto) {
        throw new Error(`Producto ${item.producto_id} no existe`);
      }

      const subtotal = producto.precio * item.cantidad;

      await DetallePedido.create({
        pedido_id: nuevoPedido.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        subtotal
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido_id: nuevoPedido.id
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { model: Cliente },
        {
          model: DetallePedido,
          include: [Producto]
        }
      ]
    });

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: [
        { model: Cliente },
        {
          model: DetallePedido,
          include: [Producto]
        }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    await pedido.destroy();

    res.json({ mensaje: 'Pedido eliminado' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPedidos,
  getPedidoById,
  crearPedido,
  eliminarPedido
};
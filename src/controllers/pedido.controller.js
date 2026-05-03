const db = require('../database/models');
const { Pedido, DetallePedido, Producto, Cliente, Categoria, Pago, EstadoPedido } = db;

const crearPedido = async (req, res) => {

  const { cliente, pedido, detalles } = req.body;

  // validacion de datos
  // Validar estructura básica
  if (!cliente || !pedido) {
    return res.status(400).json({
      error: "Datos de cliente o pedido incompletos"
    });
  }

  // Validar carrito
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({
      error: "El pedido debe contener al menos un producto"
    });
  }

  try {

    const t = await db.sequelize.transaction();

    // 1. Crear cliente
    let clienteDB = await Cliente.findOne({
      where: { cedula_ruc: cliente.cedula_ruc },
      transaction: t
    });

    if (!clienteDB) {

      clienteDB = await Cliente.create({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        cedula_ruc: cliente.cedula_ruc
      }, { transaction: t });

    } else {

      await clienteDB.update({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion
      }, { transaction: t });

    }

    let totalPedido = 0;

    // 🔹 Obtener estado "pendiente"
    const estadoPendiente = await EstadoPedido.findOne({
      where: { nombre: 'pendiente' },
      transaction: t
    });

    if (!estadoPendiente) {
      throw new Error('Estado pendiente no existe');
    }

    // 2. Crear pedido
    const nuevoPedido = await Pedido.create({
      cliente_id: clienteDB.id,
      direccion_entrega: pedido.direccion_entrega,
      estado_id: estadoPendiente.id,
      total: 0
    }, { transaction: t });

    // 3. Crear detalles con SNAPSHOT
    console.log("🔥 DETALLES QUE LLEGAN:", detalles);
    for (const item of detalles) {

      const producto = await Producto.findByPk(item.producto_id, {
        include: [{
          model: Categoria,
          as: 'categoria',   // 👈 ESTO ES LO QUE FALTA
          attributes: ['nombre']
        }],
        transaction: t
      });

      if (!producto) {
        throw new Error(`Producto ${item.producto_id} no existe`);
      }

      const precio = parseFloat(producto.precio);
      const cantidad = item.cantidad;
      const subtotal = precio * cantidad;

      totalPedido += subtotal;

      await DetallePedido.create({
        pedido_id: nuevoPedido.id,
        producto_id: producto.id, // referencia opcional
        nombre_producto: producto.nombre, // snapshot
        categoria_nombre: producto.categoria?.nombre || 'Sin categoría', // snapshot
        cantidad,
        precio_unitario: precio, // snapshot
        subtotal
      }, { transaction: t });

      console.log("🧾 DETALLE GUARDADO:", {
        pedido_id: nuevoPedido.id,
        producto_id: producto.id,
        nombre_producto: producto.nombre
      });

    }

    // 4. Actualizar total
    await nuevoPedido.update({
      total: totalPedido
    }, { transaction: t });

    await t.commit();

    const test = await DetallePedido.findAll({
      where: { pedido_id: nuevoPedido.id }
    });

    console.log("🔥 DETALLES EN BD:", test);

    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido_id: nuevoPedido.id,
      total: totalPedido
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
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: EstadoPedido,
          as: 'estado'
        },
        {
          model: DetallePedido,
          as: 'detalles'
        },
        {
          model: Pago,
          as: 'pagos'
        }
      ]
    });

    res.json(pedidos);

  } catch (error) {
    console.error("🔥 ERROR REAL:", error);
    return res.status(500).json({
      message: error.message,
      stack: error.stack
    });
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

const actualizarEstadoPedido = async (req, res) => {

  const { id } = req.params;
  const { estado_id } = req.body;

  try {

    const pedido = await db.Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado'
      });
    }

    pedido.estado_id = estado_id;
    await pedido.save();

    res.json({
      mensaje: 'Estado actualizado'
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

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
  actualizarEstadoPedido,
  eliminarPedido
};

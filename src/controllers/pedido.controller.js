const db = require('../database/models');
const { Pedido, DetallePedido, Producto, Cliente, Categoria, Pago, EstadoPedido } = db;

const crearPedido = async (req, res) => {

  const { cliente, pedido, detalles } = req.body;

  // validacion de datos
  if (!cliente || !pedido) {
    return res.status(400).json({
      error: "Datos de cliente o pedido incompletos"
    });
  }

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({
      error: "El pedido debe contener al menos un producto"
    });
  }

  // Validar que la cédula no esté vacía (opcional, según tu negocio)
  if (!cliente.cedula_ruc) {
    return res.status(400).json({
      error: "La cédula/RUC es obligatoria"
    });
  }
  
  let t;

  try {

    t = await db.sequelize.transaction();

    // 1. Buscar o CREAR cliente (NUNCA ACTUALIZAR datos personales)
    let clienteDB = await Cliente.findOne({
      where: { cedula_ruc: cliente.cedula_ruc },
      transaction: t
    });

    if (!clienteDB) {
      // Solo crear si es la primera vez que vemos esta cédula
      clienteDB = await Cliente.create({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        cedula_ruc: cliente.cedula_ruc,
        fecha_registro: new Date()
      }, { transaction: t });

      console.log(`✅ Nuevo cliente creado: ${cliente.cedula_ruc}`);
    } else {
      // 🔥 CLAVE: NO actualizamos nada en clientes existentes
      // Solo registramos que el cliente ya existe y usamos sus datos para referencia
      console.log(`🔄 Cliente existente: ${cliente.cedula_ruc} - No se actualizan sus datos personales`);

      // Opcional: podrías registrar en otra tabla que este cliente hizo un nuevo pedido
      // con datos que quizás están desactualizados, pero NO modificas la tabla clientes
    }

    // Obtener estado "pendiente"
    const estadoPendiente = await EstadoPedido.findOne({
      where: { nombre: 'pendiente' },
      transaction: t
    });

    if (!estadoPendiente) {
      throw new Error('Estado pendiente no existe en la base de datos');
    }

    let totalPedido = 0;

    // 2. Crear pedido con SNAPSHOT de los datos del cliente en ESTE momento
    const nuevoPedido = await Pedido.create({
      cliente_id: clienteDB.id,
      direccion_entrega: pedido.direccion_entrega,
      estado_id: estadoPendiente.id,
      total: 0, // temporal, se actualizará después
      // 🔥 NUEVOS CAMPOS SNAPSHOT (asumiendo que ya los agregaste al modelo)
      snapshot_nombre: cliente.nombre,
      snapshot_apellido: cliente.apellido,
      snapshot_telefono: cliente.telefono,
      snapshot_email: cliente.email,
      snapshot_cedula_ruc: cliente.cedula_ruc
    }, { transaction: t });

    // 3. Crear detalles con SNAPSHOT de productos
    for (const item of detalles) {

      // Buscar producto con su categoría para hacer snapshot
      const producto = await Producto.findByPk(item.producto_id, {
        include: [{
          model: Categoria,
          as: 'categoria',
          attributes: ['nombre']
        }],
        transaction: t
      });

      if (!producto) {
        throw new Error(`Producto con ID ${item.producto_id} no existe`);
      }

      const precio = parseFloat(producto.precio);
      const cantidad = parseInt(item.cantidad);
      const subtotal = precio * cantidad;

      totalPedido += subtotal;

      await DetallePedido.create({
        pedido_id: nuevoPedido.id,
        producto_id: producto.id,
        nombre_producto: producto.nombre, // snapshot histórico
        categoria_nombre: producto.categoria?.nombre || 'Sin categoría', // snapshot histórico
        cantidad: cantidad,
        precio_unitario: precio, // snapshot histórico (precio al momento de la compra)
        subtotal: subtotal
      }, { transaction: t });

    }

    // 4. Actualizar el total del pedido
    await nuevoPedido.update({
      total: totalPedido
    }, { transaction: t });

    await t.commit();

    // Respuesta exitosa
    res.status(201).json({
      mensaje: 'Pedido creado correctamente con historial preservado',
      pedido_id: nuevoPedido.id,
      total: totalPedido,
      cliente: {
        existente: clienteDB !== null,
        cedula: cliente.cedula_ruc,
        datos_usados_en_pedido: {
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono,
          email: cliente.email
        }
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      error: 'Error interno al procesar el pedido',
      detalle: error.message
    });
  }
};

// 📊 NUEVA FUNCIÓN: Obtener historial real de pedidos (lo que mostrarás en pestaña pedidos)
const obtenerHistorialPedidos = async (req, res) => {
  try {
    const { cedula_ruc } = req.query; // opcional: filtrar por cédula

    const whereCondition = {};
    if (cedula_ruc) {
      whereCondition.snapshot_cedula_ruc = cedula_ruc;
    }

    const pedidos = await Pedido.findAll({
      where: whereCondition,
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          attributes: ['nombre_producto', 'categoria_nombre', 'cantidad', 'precio_unitario', 'subtotal']
        },
        {
          model: EstadoPedido,
          as: 'estado',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'DESC']],
      attributes: [
        'id',
        'fecha',
        'total',
        'direccion_entrega',
        'snapshot_nombre',
        'snapshot_apellido',
        'snapshot_telefono',
        'snapshot_email',
        'snapshot_cedula_ruc'
      ]
    });

    res.json({
      success: true,
      pedidos: pedidos.map(p => ({
        pedido_id: p.id,
        fecha: p.fecha,
        total: p.total,
        direccion_entrega: p.direccion_entrega,
        cliente_en_momento: {
          nombre: p.snapshot_nombre,
          apellido: p.snapshot_apellido,
          telefono: p.snapshot_telefono,
          email: p.snapshot_email,
          cedula: p.snapshot_cedula_ruc
        },
        estado: p.estado?.nombre,
        detalles: p.detalles
      }))
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: error.message });
  }
};

// 🛠️ FUNCIÓN OPCIONAL: Para corregir cédulas mal escritas (con auditoría)
const corregirCedulaPedido = async (req, res) => {
  const { pedido_id, nueva_cedula } = req.body;

  try {
    const pedido = await Pedido.findByPk(pedido_id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar si la nueva cédula ya existe como cliente
    let clienteExistente = await Cliente.findOne({
      where: { cedula_ruc: nueva_cedula }
    });

    // Si no existe, crear un nuevo cliente con los datos del snapshot del pedido
    if (!clienteExistente) {
      clienteExistente = await Cliente.create({
        nombre: pedido.snapshot_nombre,
        apellido: pedido.snapshot_apellido,
        telefono: pedido.snapshot_telefono,
        email: pedido.snapshot_email,
        cedula_ruc: nueva_cedula,
        fecha_registro: new Date()
      });
    }

    // Actualizar el pedido con el nuevo cliente_id y el snapshot de cédula corregida
    await pedido.update({
      cliente_id: clienteExistente.id,
      snapshot_cedula_ruc: nueva_cedula
    });

    res.json({
      success: true,
      mensaje: `Pedido ${pedido_id} corregido a cédula ${nueva_cedula}`,
      pedido_actualizado: pedido
    });

  } catch (error) {
    console.error('Error al corregir cédula:', error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          attributes: ['nombre_producto', 'categoria_nombre', 'cantidad', 'precio_unitario', 'subtotal']
        }
      ],
      attributes: [
        'id', 'fecha', 'total', 'direccion_entrega', 'estado_id',
        'snapshot_nombre', 'snapshot_apellido', 'snapshot_telefono',
        'snapshot_email', 'snapshot_cedula_ruc'
      ]
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({
      success: true,
      pedido: {
        ...pedido.toJSON(),
        cliente_en_momento: {
          nombre: pedido.snapshot_nombre,
          apellido: pedido.snapshot_apellido,
          telefono: pedido.snapshot_telefono,
          email: pedido.snapshot_email,
          cedula: pedido.snapshot_cedula_ruc
        }
      }
    });

  } catch (error) {
    console.error('Error:', error);
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
  crearPedido,
  obtenerHistorialPedidos,
  corregirCedulaPedido,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  eliminarPedido
};

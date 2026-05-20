const db = require('../database/models');
const { Producto, Categoria } = db;
const { subirImagen, eliminarImagen } = require('../services/uploadImage');
const { emitEventoGlobal } = require('../services/websocket');

const crearProducto = async (req, res) => {
  try {
    let imagenUrl = null;

    if (req.file) {
      const result = await subirImagen(req.file);
      imagenUrl = result.secure_url;
    }

    const producto = await Producto.create({
      ...req.body,
      imagen: imagenUrl
    });

    emitEventoGlobal('producto_creado', producto);

    res.status(201).json(producto);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearProducto };

// 🔹 Obtener todos los productos
const getProductos = async (req, res) => {
  try {

    const { popular, nuevo, activo } = req.query;

    const where = {};

    // 🔥 filtro populares (landing)
    if (popular === 'true') {
      where.es_popular = true;
    }
    // opcional: solo activos
    if (nuevo === 'true') {
      where.es_nuevo = true;
    }

    // 🧠 opcional: solo activos
    if (activo === 'true') {
      where.activo = true;
    }

    const productos = await Producto.findAll({
      where,
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json(productos);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtener producto por ID
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json(producto);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let imagenUrl = producto.imagen;

    // 🔥 si llega nueva imagen
    if (req.file) {
      // eliminar anterior
      await eliminarImagen(producto.imagen);

      // subir nueva
      const result = await subirImagen(req.file);
      imagenUrl = result.secure_url;
    }

    await producto.update({
      ...req.body,
      imagen: imagenUrl
    });

    emitEventoGlobal('producto_actualizado', producto);

    res.json({
      message: 'Producto actualizado',
      producto
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await producto.destroy();

    emitEventoGlobal('producto_eliminado', {
      id: producto.id
    });

    res.json({ mensaje: 'Producto eliminado' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  cambia unicamente el estado activo, no elimina físicamente el producto
*/
const cambiarEstadoProducto = async (req, res) => {
  try {

    const { id } = req.params;
    const { activo } = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    producto.activo = activo;
    await producto.save();

    emitEventoGlobal('producto_estado', {
      id: producto.id,
      activo: producto.activo
    });

    res.json({ mensaje: 'Estado actualizado', activo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error actualizando estado' });
  }
};

module.exports = {
  crearProducto,
  getProductos,
  getProductoById,
  actualizarProducto,
  eliminarProducto,
  cambiarEstadoProducto
};
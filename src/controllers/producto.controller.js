const db = require('../database/models');
const { Producto, Categoria } = db;
const { subirImagen, eliminarImagen } = require('../services/uploadImage');

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

    res.status(201).json(producto);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { crearProducto };

// 🔹 Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre']
        }
      ]
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

    res.json({
      message: 'Producto actualizado',
      producto
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearProducto,
  actualizarProducto
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

    res.json({ mensaje: 'Producto eliminado' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearProducto,
  getProductos,
  getProductoById,
  actualizarProducto,
  eliminarProducto
};
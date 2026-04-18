const db = require('../database/models');
const { Producto } = db;

// 🔹 Crear producto
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen_url } = req.body;

    const producto = await Producto.create({
      nombre,
      descripcion,
      precio,
      imagen_url
    });

    res.status(201).json(producto);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
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
    const { nombre, descripcion, precio, imagen_url } = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await producto.update({
      nombre,
      descripcion,
      precio,
      imagen_url
    });

    res.json({ mensaje: 'Producto actualizado', producto });

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
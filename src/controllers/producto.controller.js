const db = require('../database/models');
const { Producto, Categoria } = db;

// 🔹 Crear producto con imagen
const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      categoria_id,
      descripcion,
      precio,
      stock,
      es_nuevo,
      es_popular,
      activo
    } = req.body;

    const imagen = req.file ? req.file.path : null;

    const producto = await Producto.create({
      nombre,
      categoria_id,
      descripcion,
      precio,
      stock,
      es_nuevo,
      es_popular,
      activo,
      imagen
    });

    res.status(201).json(producto);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// 🔹 actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'No encontrado' });
    }

    const imagen = req.file ? req.file.path : producto.imagen;

    await producto.update({
      ...req.body,
      imagen
    });

    res.json(producto);

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
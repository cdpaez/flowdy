const db = require('../database/models');
const { Categoria } = db;

// 🔹 Crear categoría
const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    const categoria = await Categoria.create({ nombre });

    res.status(201).json(categoria);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['id', 'ASC']]
    });

    res.json(categorias);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Obtener categoría por ID
const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    res.json(categoria);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Actualizar categoría
const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    await categoria.update({ nombre });

    res.json({
      mensaje: 'Categoría actualizada',
      categoria
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Eliminar categoría
const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    await categoria.destroy();

    res.json({ mensaje: 'Categoría eliminada' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearCategoria,
  getCategorias,
  getCategoriaById,
  actualizarCategoria,
  eliminarCategoria
};
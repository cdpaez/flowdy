const db = require('../database/models');

const EstadoPedido = db.EstadoPedido;

const getEstadosPedidos = async (req, res) => {

  try {

    const estados = await EstadoPedido.findAll({
      order: [['orden', 'ASC']]
    });

    res.json(estados);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

module.exports = {
  getEstadosPedidos
};
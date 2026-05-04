module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    estado_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },

    direccion_entrega: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 🔥 NUEVOS CAMPOS SNAPSHOT (datos del cliente en el momento del pedido)
    snapshot_nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },

    snapshot_apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },

    snapshot_telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },

    snapshot_email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    snapshot_cedula_ruc: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'pedidos',
    timestamps: false
  });

  return Pedido;
};
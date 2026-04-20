module.exports = (sequelize, DataTypes) => {
  const Pago = sequelize.define('Pago', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    pedido_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    metodo: {
      type: DataTypes.STRING,
      allowNull: false
    },

    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'pagos',
    timestamps: false
  });

  return Pago;
};
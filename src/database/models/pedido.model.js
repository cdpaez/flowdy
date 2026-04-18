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
    fecha_pedido: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: 'pendiente'
    },
    tipo_entrega: {
      type: DataTypes.STRING,
      allowNull: false // domicilio | retiro
    },
    direccion_entrega: DataTypes.STRING,
    forma_pago: {
      type: DataTypes.STRING,
      defaultValue: 'efectivo'
    }
  }, {
    tableName: 'pedidos',
    timestamps: true
  });

  return Pedido;
};
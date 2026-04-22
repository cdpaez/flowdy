module.exports = (sequelize, DataTypes) => {
  const EstadoPedido = sequelize.define('EstadoPedido', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'estados_pedido',
    timestamps: false
  });

  return EstadoPedido;
};
module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: DataTypes.TEXT,
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    imagen_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'productos',
    timestamps: false
  });

  return Producto;
};
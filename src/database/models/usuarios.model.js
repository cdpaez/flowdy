module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rol_usuario: {
      type: DataTypes.ENUM('admin', 'vendedor'),
      defaultValue: 'vendedor',
      allowNull: false
    },
  }, {
    paranoid: true,           // habilita soft deletes (usa deletedAt)
    tableName: 'usuarios',
    timestamps: true,         // <--- activa createdAt y updatedAt
    createdAt: 'created_at',  // <--- si quieres personalizar el nombre de la columna
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return Usuario;
};

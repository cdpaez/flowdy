'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

// Configurar la conexión
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Cargar modelos automáticamente
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Definir asociaciones manualmente (mejor que en los archivos de modelos)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 🔗 CLIENTE → PEDIDOS
db.Cliente.hasMany(db.Pedido, {
  foreignKey: 'cliente_id',
  as: 'pedidos',
  onDelete: 'CASCADE'
});

db.Pedido.belongsTo(db.Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});


// 🔗 PEDIDO → DETALLES
db.Pedido.hasMany(db.DetallePedido, {
  foreignKey: 'pedido_id',
  as: 'detalles',
  onDelete: 'CASCADE'
});

db.DetallePedido.belongsTo(db.Pedido, {
  foreignKey: 'pedido_id',
  as: 'pedido'
});

// 📂 CATEGORIA → PRODUCTOS
db.Categoria.hasMany(db.Producto, {
  foreignKey: 'categoria_id',
  as: 'productos',
  onDelete: 'CASCADE'
});

db.Producto.belongsTo(db.Categoria, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});


// 💳 PEDIDO → PAGOS
db.Pedido.hasMany(db.Pago, {
  foreignKey: 'pedido_id',
  as: 'pagos',
  onDelete: 'CASCADE'
});

db.Pago.belongsTo(db.Pedido, {
  foreignKey: 'pedido_id',
  as: 'pedido'
});

// 📌 ESTADOS_PEDIDOS → PEDIDOS
db.EstadoPedido.hasMany(db.Pedido, {
  foreignKey: 'estado_id',
  as: 'pedidos'
});

db.Pedido.belongsTo(db.EstadoPedido, {
  foreignKey: 'estado_id',
  as: 'estado'
});

// Exportar
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
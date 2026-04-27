'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_pedidos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      pedido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pedidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      // SNAPSHOT HISTORICO
      nombre_producto: {
        type: Sequelize.STRING,
        allowNull: false
      },

      categoria_nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },

      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('detalle_pedidos');
  }
};

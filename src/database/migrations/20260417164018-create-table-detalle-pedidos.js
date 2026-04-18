'use strict';

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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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

  async down(queryInterface) {
    await queryInterface.dropTable('detalle_pedidos');
  }
};
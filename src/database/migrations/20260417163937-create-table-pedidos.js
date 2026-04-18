'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pedidos', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      fecha_pedido: {
        type: Sequelize.DATE,
        allowNull: false
      },

      fecha_entrega: {
        type: Sequelize.DATE,
        allowNull: false
      },

      estado: {
        type: Sequelize.STRING,
        defaultValue: 'pendiente'
      },

      tipo_entrega: {
        type: Sequelize.STRING,
        allowNull: false
      },

      direccion_entrega: {
        type: Sequelize.STRING,
        allowNull: true
      },

      forma_pago: {
        type: Sequelize.STRING,
        defaultValue: 'efectivo'
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pedidos');
  }
};
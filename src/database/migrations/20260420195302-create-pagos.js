'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagos', {
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

      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      metodo: {
        type: Sequelize.STRING,
        allowNull: false
      },

      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
      },

      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pagos');
  }
};

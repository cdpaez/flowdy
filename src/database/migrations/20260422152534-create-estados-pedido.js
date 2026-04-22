'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estados_pedido', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },

      color: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      orden: {
        type: Sequelize.STRING,
        allowNull: false
      },

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('estados_pedido');
  }
};

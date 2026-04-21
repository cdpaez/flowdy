'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },

      apellido: {
        type: Sequelize.STRING,
        allowNull: false
      },

      telefono: {
        type: Sequelize.STRING,
        allowNull: false
      },

      correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      direccion: {
        type: Sequelize.STRING,
        allowNull: false
      },

      cedula_ruc: {
        type: Sequelize.STRING,
        allowNull: true
      },

      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes');
  }
};

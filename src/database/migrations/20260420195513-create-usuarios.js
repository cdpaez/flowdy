'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      rol: {
        type: Sequelize.ENUM('admin', 'lector'),
        allowNull: false,
        defaultValue: 'admin'
      },

      estado: {
        type: Sequelize.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo'
      }

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');

    // 🔥 importante cuando usas ENUM en PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_usuarios_rol";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_usuarios_estado";');
  }
};

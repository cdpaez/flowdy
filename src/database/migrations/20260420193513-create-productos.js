'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      imagen: {
        type: Sequelize.STRING,
        allowNull: false
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      es_nuevo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      es_popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },



    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
  }
};

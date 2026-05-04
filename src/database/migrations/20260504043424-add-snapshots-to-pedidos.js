'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('pedidos', 'snapshot_nombre', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('pedidos', 'snapshot_apellido', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('pedidos', 'snapshot_telefono', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('pedidos', 'snapshot_email', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('pedidos', 'snapshot_cedula_ruc', {
      type: Sequelize.STRING,
      allowNull: true
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('pedidos', 'snapshot_nombre');
    await queryInterface.removeColumn('pedidos', 'snapshot_apellido');
    await queryInterface.removeColumn('pedidos', 'snapshot_telefono');
    await queryInterface.removeColumn('pedidos', 'snapshot_email');
    await queryInterface.removeColumn('pedidos', 'snapshot_cedula_ruc');

  }
};
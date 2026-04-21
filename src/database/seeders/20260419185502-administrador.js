'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verifica si ya existen los usuarios por su correo
    const [existingUsers] = await queryInterface.sequelize.query(`
      SELECT email FROM usuarios 
      WHERE email IN ('adm@correo.com');
    `);

    const existingEmails = existingUsers.map(user => user.email);

    const usersToInsert = [];

    if (!existingEmails.includes('adm@correo.com')) {
      const hashedPassword1 = await bcrypt.hash('123', 10);
      usersToInsert.push({
        nombre: 'admin',
        email: 'adm@correo.com',
        password: hashedPassword1,
        rol: 'admin',
        estado: 'activo'
      });
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('usuarios', usersToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      email: ['adm@correo.com']
    }, {});
  }
};

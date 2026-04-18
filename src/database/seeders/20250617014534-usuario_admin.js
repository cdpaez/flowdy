'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verifica si ya existen los usuarios por su correo
    const [existingUsers] = await queryInterface.sequelize.query(`
      SELECT correo FROM usuarios 
      WHERE correo IN ('adm@correo.com', 'op@correo.com');
    `);

    const existingEmails = existingUsers.map(user => user.correo);

    const usersToInsert = [];

    if (!existingEmails.includes('adm@correo.com')) {
      const hashedPassword1 = await bcrypt.hash('123', 10);
      usersToInsert.push({
        nombre: 'Admin',
        correo: 'adm@correo.com',
        password: hashedPassword1,
        rol_usuario: 'admin',
        estado: 'activo',
        created_at: new Date(),
        updated_at: new Date() 
      });
    }

    if (!existingEmails.includes('op@correo.com')) {
      const hashedPassword2 = await bcrypt.hash('123', 10);
      usersToInsert.push({
        nombre: 'operador',
        correo: 'op@correo.com',
        password: hashedPassword2,
        rol_usuario: 'vendedor',
        estado: 'activo',
        created_at: new Date(),
        updated_at: new Date() 
      });
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('usuarios', usersToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      correo: ['Jose@example.com', 'Andres@example.com']
    }, {});
  }
};

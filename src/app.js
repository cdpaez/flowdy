// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Archivos estáticos

// Servir archivos estáticos desde la carpeta /client
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Página principal (al acceder a "/")
//app.get('/', (req, res) => {
//  res.sendFile(path.join(__dirname, '../client/index.html'));
//});

// Landing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/landing/index.html'));
});

// Admin login
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin/index.html'));
});

// Rutas API
app.use('/login', require('./routes/login.routes'));

app.use('/api/categorias', require('./routes/categoria.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/pedidos', require('./routes/pedido.routes'));
app.use('/api/estados-pedidos', require('./routes/estadosPedido.routes'));
app.use('/api/estadisticas', require('./routes/estadisticas.routes'));
app.use('/usuarios', require('./routes/usuario.routes'));

// Error de multer (archivos pesados)
const multer = require('multer');

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'La imagen es demasiado grande. Máximo permitido: 5MB'
      });
    }
  }

  next(err);
});

// Error general
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

// Exportar solo la app
module.exports = app;

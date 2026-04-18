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

// Servir archivos estáticos desde la carpeta /frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Página principal (al acceder a "/")
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rutas API
app.use('/api/pedidos', require('./routes/pedido.routes'));

// Exportar solo la app
module.exports = app;

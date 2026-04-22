const cloudinary = require('../config/cloudinary');

// subir imagen
const subirImagen = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'productos',

        // 🔥 optimización automática
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// eliminar imagen
const eliminarImagen = async (url) => {
  try {
    if (!url) return;

    const partes = url.split('/');
    const nombreArchivo = partes[partes.length - 1];
    const publicId = `productos/${nombreArchivo.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log('Error eliminando imagen:', error.message);
  }
};

module.exports = { subirImagen, eliminarImagen };
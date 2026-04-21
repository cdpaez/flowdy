// bloque encargado de navegar entre las secciones
function mostrarSeccion(id, botonClicado) {
  // Oculta todas las secciones
  const secciones = document.querySelectorAll('.seccion');
  secciones.forEach(seccion => seccion.classList.remove('activa'));

  // Muestra la que se seleccionó
  const seccionActiva = document.getElementById(id);
  if (seccionActiva) {
    seccionActiva.classList.add('activa');
  }

  // Actualiza los estilos del botón activo
  const botones = document.querySelectorAll('.pestanas button');
  botones.forEach(btn => btn.classList.remove('activo'));

  botonClicado.classList.add('activo');
}
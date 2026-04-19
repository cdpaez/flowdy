// bloque encargado de navegar entre las secciones
function mostrarSeccionStats(id) {
  // Oculta todas las secciones
  const secciones = document.querySelectorAll('.grafica-card');
  secciones.forEach(seccion => seccion.classList.remove('activa'));

  // Muestra la que se seleccionó
  const seccionActiva = document.getElementById(id);
  if (seccionActiva) {
    seccionActiva.classList.add('activa');
  }
}
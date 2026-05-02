function mostrarSeccionStats(id) {

  const secciones = document.querySelectorAll('.grafica-card');
  secciones.forEach(s => s.classList.remove('activa'));

  const activa = document.getElementById(id);
  if (activa) activa.classList.add('activa');

  setTimeout(() => {
    if (window.graficos) {
      const chart = window.graficos[id]?.();
      chart?.resize?.();
    }
  }, 80);
}
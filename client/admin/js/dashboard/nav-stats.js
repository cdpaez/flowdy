function mostrarSeccionStats(tab) {

  // Tabs activos
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.tab === tab);
  });

  // Vistas
  document.querySelectorAll('.chart-view').forEach(view => {
    view.classList.remove('activa');
  });

  const target = document.getElementById(`tab-${tab}`);
  if (target) {
    target.classList.add('activa');
  }

  // Fix Chart.js resize
  setTimeout(() => {
    const canvas = document.getElementById(`chart-${tab}`);
    const chart = canvas ? Chart.getChart(canvas) : null;
    if (chart) chart.resize();
  }, 80);
}

document.addEventListener('DOMContentLoaded', () => {

  // conectar tabs con la función
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      mostrarSeccionStats(tab);
    });
  });

  // activar tab inicial
  mostrarSeccionStats('pedidos');
});
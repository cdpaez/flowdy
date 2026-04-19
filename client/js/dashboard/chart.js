const GraficosModule = (function () {
    // Variables privadas
    const fechaDesdeInput = document.getElementById('fecha-desde');
    const fechaHastaInput = document.getElementById('fecha-hasta');
    const btnReset = document.getElementById('resetear-filtro');

    const ctxActas = document.getElementById('grafica-mis-ventas').getContext('2d');
    const ctxEquipos = document.getElementById('grafica-mis-productos').getContext('2d');
    const ctxTotales = document.getElementById('totalGeneradoPorUsuario').getContext('2d');

    const mensajeVacioActas = document.getElementById('mensaje-vacio-actas');
    const mensajeVacioEquipos = document.getElementById('mensaje-vacio-equipos');
    const mensajeVacioTotales = document.getElementById('mensaje-vacio-totales');

    let chartActas = null;
    let chartEquipos = null;
    let chartTotales = null;

    // 🎨 Función para generar colores variados
    const generarColores = (cantidad) => {
        const base = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
        ];
        return Array.from({ length: cantidad }, (_, i) => base[i % base.length]);
    };

    // 📊 Cargar gráfico de actas por usuario
    async function cargarGraficoActas(fechaDesde = '', fechaHasta = '') {
        let url = '/chart/actas-por-usuario';
        if (fechaDesde && fechaHasta) url += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.ok) throw new Error(data.error || 'No se pudo cargar la información');

            if (data.datos.length === 0) {
                if (chartActas) chartActas.destroy();
                mensajeVacioActas.style.display = 'block';
                return;
            } else {
                mensajeVacioActas.style.display = 'none';
            }

            const labels = data.datos.map(i => i.vendedor);
            const valores = data.datos.map(i => i.total);
            const colores = generarColores(valores.length);
            const coloresBorde = colores.map(c => c.replace('0.7', '1'));

            if (chartActas) chartActas.destroy();

            chartActas = new Chart(ctxActas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Actas Registradas',
                        data: valores,
                        backgroundColor: colores,
                        borderColor: coloresBorde,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total de Actas por Usuario',
                            color: '#ffffff'
                        },
                        legend: {
                            labels: { color: '#ffffff' }
                        },
                        tooltip: {
                            backgroundColor: '#ffffff',
                            titleColor: '#000000',
                            bodyColor: '#000000',
                            callbacks: {
                                label: context => `${context.formattedValue} actas`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#ffffff' },
                            title: { display: false },
                            grid: { color: '#ffffff' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#ffffff', precision: 0 },
                            title: { display: false },
                            grid: { color: '#ffffff' }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Error en gráfico de actas:', err);
        }
    }

    // 📊 Cargar gráfico de equipos entregados por mes
    async function cargarGraficoEquipos(fechaDesde = '', fechaHasta = '') {
        let url = '/chart/equipos-mas-vendidos';
        if (fechaDesde && fechaHasta) {
            url += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.ok) throw new Error(data.error || 'No se pudo cargar la información');

            if (data.datos.length === 0) {
                if (chartEquipos) chartEquipos.destroy();
                mensajeVacioEquipos.style.display = 'block';
                return;
            } else {
                mensajeVacioEquipos.style.display = 'none';
            }

            const mesesUnicos = [...new Set(data.datos.map(d => {
                const fecha = new Date(d.mes);
                fecha.setUTCHours(12);
                return fecha.toLocaleString('es-EC', { month: 'long', year: 'numeric' });
            }))];

            const equiposUnicos = [...new Set(data.datos.map(d => d.equipo))];

            const datosPorEquipo = {};
            equiposUnicos.forEach(equipo => {
                datosPorEquipo[equipo] = mesesUnicos.map(() => 0);
            });

            data.datos.forEach(item => {
                const fecha = new Date(item.mes);
                fecha.setUTCHours(12);
                const mes = fecha.toLocaleString('es-EC', { month: 'long', year: 'numeric' });
                const indiceMes = mesesUnicos.indexOf(mes);
                if (indiceMes !== -1) {
                    datosPorEquipo[item.equipo][indiceMes] = item.cantidad;
                }
            });

            const colores = generarColores(equiposUnicos.length);

            const datasets = equiposUnicos.map((equipo, i) => ({
                label: equipo,
                data: datosPorEquipo[equipo],
                backgroundColor: colores[i],
                borderColor: colores[i].replace('0.7', '1'),
                borderWidth: 1
            }));

            if (chartEquipos) chartEquipos.destroy();

            chartEquipos = new Chart(ctxEquipos, {
                type: 'bar',
                data: {
                    labels: mesesUnicos,
                    datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Equipos entregados por mes',
                            color: '#ffffff'
                        },
                        legend: {
                            display: window.innerWidth > 768,
                            labels: { color: '#ffffff' }
                        },
                        tooltip: {
                            backgroundColor: '#ffffff',
                            titleColor: '#000000',
                            bodyColor: '#000000',
                            callbacks: {
                                label: context => `${context.dataset.label}: ${context.formattedValue}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#ffffff', maxRotation: 45, minRotation: 30 },
                            title: { display: false },
                            grid: { color: '#ffffff' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#ffffff', precision: 0 },
                            title: { display: false },
                            grid: { color: '#ffffff' }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Error en gráfico de equipos:', err);
        }
    }

    // 🔁 Cargar gráfico de totales generados por usuario
    async function cargarGraficoTotales(fechaDesde = '', fechaHasta = '') {
        let url = '/chart/total-por-usuario';
        if (fechaDesde && fechaHasta) {
            url += `?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.ok) throw new Error(data.error || 'No se pudo cargar la información');

            if (data.datos.length === 0) {
                if (chartTotales) chartTotales.destroy();
                if (mensajeVacioTotales) mensajeVacioTotales.style.display = 'block';
                return;
            } else {
                if (mensajeVacioTotales) mensajeVacioTotales.style.display = 'none';
            }

            const labels = data.datos.map(d => {
                const fecha = new Date(d.mes);
                fecha.setUTCHours(12);
                return fecha.toLocaleString('es-EC', { month: 'long', year: 'numeric' });
            });

            const valores = data.datos.map(d => Number(d.total.toFixed(2)));
            const colores = generarColores(valores.length);
            const coloresBorde = colores.map(c => c.replace('0.7', '1'));

            if (chartTotales) chartTotales.destroy();

            chartTotales = new Chart(ctxTotales, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Total Generado ($)',
                        data: valores,
                        backgroundColor: colores,
                        borderColor: coloresBorde,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Ingresos Generados por Mes',
                            color: '#ffffff'
                        },
                        legend: {
                            labels: { color: '#ffffff' }
                        },
                        tooltip: {
                            backgroundColor: '#ffffff',
                            titleColor: '#000000',
                            bodyColor: '#000000',
                            callbacks: {
                                label: context => `$${context.formattedValue}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#ffffff' },
                            title: { display: false },
                            grid: { color: '#ffffff' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ffffff',
                                callback: value => `$${value}`
                            },
                            title: { display: false },
                            grid: { color: '#ffffff' }
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Error en gráfico de totales:', err);
        }
    }

    // Eventos para filtro de fechas
    function initEventos() {
        [fechaDesdeInput, fechaHastaInput].forEach(input => {
            input.addEventListener('change', () => {
                const desde = fechaDesdeInput.value;
                const hasta = fechaHastaInput.value;

                if (!desde || !hasta) return;

                if (new Date(desde) > new Date(hasta)) {
                    alert('⚠️ La fecha "Desde" no puede ser mayor que la fecha "Hasta".');
                    return;
                }

                cargarGraficoActas(desde, hasta);
                cargarGraficoEquipos(desde, hasta);
                cargarGraficoTotales(desde, hasta);
            });
        });

        btnReset.addEventListener('click', () => {
            fechaDesdeInput.value = '';
            fechaHastaInput.value = '';
            cargarGraficoActas();
            cargarGraficoEquipos();
            cargarGraficoTotales();
        });
    }

    // Función pública para iniciar todo
    function init() {
        initEventos();
        cargarGraficoActas();
        cargarGraficoEquipos();
        cargarGraficoTotales();
    }

    // Solo exponemos init
    return { init };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    GraficosModule.init();
});

const GraficosModule = (function () {

    let chartPedidos = null;
    let chartStock = null;
    let chartIngresos = null;

    let ctxPedidos = null;
    let ctxStock = null;
    let ctxIngresos = null;

    // pluggin global
    const chartDarkBackground = {
        id: 'chartDarkBackground',
        beforeDraw: (chart) => {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.fillStyle = '#0f0f10'; // fondo oscuro consistente
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    };

    Chart.register(chartDarkBackground);

    async function cargarGraficoPedidos() {
        try {
            const res = await fetch('/api/estadisticas/pedidos-semana');
            const data = await res.json();

            const inicio = new Date(data.rango.inicio);
            const fin = new Date(data.rango.fin);

            const titulo = `Semana del ${inicio.toLocaleDateString()} al ${fin.toLocaleDateString()}`;
            if (chartPedidos) chartPedidos.destroy();

            chartPedidos = new Chart(ctxPedidos, {
                type: 'bar',
                data: {
                    labels: ['Pedidos'], // eje único
                    datasets: [
                        {
                            label: 'Pendientes',
                            data: [data.pendiente || 0],
                            backgroundColor: 'rgba(255,193,7,0.7)'
                        },
                        {
                            label: 'Hechos',
                            data: [data.hecho || 0],
                            backgroundColor: 'rgba(23,162,184,0.7)'
                        },
                        {
                            label: 'Entregados',
                            data: [data.entregado || 0],
                            backgroundColor: 'rgba(40,167,69,0.7)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#fff'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                title: () => `Semana actual`,
                                label: (context) => {
                                    return `Total: ${context.raw}`;
                                }
                            }
                        }
                    },

                    scales: {
                        x: {
                            ticks: { color: '#fff' },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                            beginAtZero: true,
                            suggestedMin: 0,
                            suggestedMax: undefined,
                            ticks: { color: '#fff', precision: 0 },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                    }
                },

                plugins: [chartDarkBackground]
            });

        } catch (err) {
            console.error('Error pedidos:', err);
        }
    }

    async function cargarGraficoStock() {
        try {
            const res = await fetch('/api/estadisticas/stock-productos');
            const data = await res.json();

            if (chartStock) chartStock.destroy();

            chartStock = new Chart(ctxStock, {
                type: 'pie',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        label: 'Stock',
                        data: data.data || [],
                        backgroundColor: [
                            'rgba(96,165,250,0.8)',
                            'rgba(59,130,246,0.8)',
                            'rgba(147,197,253,0.8)',
                            'rgba(37,99,235,0.8)',
                            'rgba(29,78,216,0.8)',
                            'rgba(30,64,175,0.8)'
                        ],
                        borderColor: '#0f0f10',
                        borderWidth: 2,
                        hoverOffset: 12
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '40%',

                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#ffffff',
                                usePointStyle: true,
                                padding: 15
                            }
                        },

                        title: {
                            display: true,
                            text: 'Stock por producto',
                            color: '#ffffff'
                        },

                        tooltip: {
                            enabled: true,
                            backgroundColor: '#111',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#333',
                            borderWidth: 1
                        }
                    }
                },

                plugins: [chartDarkBackground]
            });

        } catch (err) {
            console.error('Error gráfico stock:', err);
        }
    }

    async function cargarGraficoIngresos() {
        try {
            const res = await fetch('/api/estadisticas/ingresos-mensuales');
            const data = await res.json();

            if (chartIngresos) chartIngresos.destroy();

            chartIngresos = new Chart(ctxIngresos, {
                type: 'line',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        label: 'Ingresos',
                        data: data.data || [],
                        fill: false,
                        tension: 0.3,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#fff' } },
                        title: {
                            display: true,
                            text: 'Ingresos',
                            color: '#fff'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const value = context.parsed.y;
                                    return `Ingresos: $${value.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            border: { color: '#ffffff' }
                        },
                        y: {
                            ticks: { color: '#ffffff' },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            border: { color: '#ffffff' },
                            beginAtZero: true
                        }
                    }
                },
                plugins: [chartDarkBackground]
            });

        } catch (err) {
            console.error('Error ingresos:', err);
        }
    }

    function init() {

        const canvasPedidos = document.getElementById('chart-pedidos');
        const canvasStock = document.getElementById('chart-stock');
        const canvasIngresos = document.getElementById('chart-ingresos');

        if (!canvasPedidos || !canvasStock || !canvasIngresos) {
            console.error('Canvas no encontrado');
            return;
        }

        ctxPedidos = canvasPedidos.getContext('2d');
        ctxStock = canvasStock.getContext('2d');
        ctxIngresos = canvasIngresos.getContext('2d');

        cargarGraficoPedidos();
        cargarGraficoStock();
        cargarGraficoIngresos();
    }

    return {
        init,
        refreshPedidos: cargarGraficoPedidos,
        refreshStock: cargarGraficoStock,
        refreshIngresos: cargarGraficoIngresos
    };

})();

document.addEventListener('DOMContentLoaded', () => {
    GraficosModule.init();
});
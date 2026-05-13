const GraficosModule = (function () {

    let charts = {
        pedidos: null,
        stock: null,
        ingresos: null
    };

    let ctx = {
        pedidos: null,
        stock: null,
        ingresos: null
    };

    let filtros = {
        desde: null,
        hasta: null
    };

    const inputDesde = document.getElementById('fecha-desde');
    const inputHasta = document.getElementById('fecha-hasta');
    const btnReset = document.getElementById('resetear-filtro');

    const chartDarkBackground = {
        id: 'chartDarkBackground',
        beforeDraw: (chart) => {
            const { ctx, width, height } = chart;
            ctx.save();
            ctx.fillStyle = '#0f0f10';
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    };

    Chart.register(chartDarkBackground);

    function destroyChart(chart) {
        if (chart) chart.destroy();
    }

    async function cargarGraficoPedidos() {
        try {

            const params = new URLSearchParams();

            if (filtros.desde && filtros.hasta) {
                params.append('desde', filtros.desde);
                params.append('hasta', filtros.hasta);
            } else {
                params.append('año', new Date().getFullYear());
            }

            const url = `/api/estadisticas/pedidos?${params.toString()}`;
            const res = await fetch(url);

            if (!res.ok) {
                console.warn('Respuesta no válida:', res.status);
                return;
            }

            const data = await res.json();

            destroyChart(charts.pedidos);

            charts.pedidos = new Chart(ctx.pedidos, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: data.datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { color: '#fff' }
                        },
                        title: {
                            display: true,
                            text: data.titulo,
                            color: '#fff',
                            font: { size: 16 }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value} pedido${value !== 1 ? 's' : ''}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#fff', rotation: 45 },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#fff', precision: 0 },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            title: {
                                display: true,
                                text: 'Cantidad de pedidos',
                                color: '#fff'
                            }
                        }
                    }
                },
                plugins: [chartDarkBackground]
            });

        } catch (err) {
            console.error('[Pedidos] error:', err);
        }
    }

    async function cargarGraficoStock() {
        try {

            const res = await fetch('/api/estadisticas/stock-productos');
            const data = await res.json();

            destroyChart(charts.stock);

            charts.stock = new Chart(ctx.stock, {
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
                                color: '#fff',
                                usePointStyle: true,
                                padding: 15
                            }
                        },
                        title: {
                            display: true,
                            text: 'Stock por producto',
                            color: '#fff'
                        }
                    }
                },
                plugins: [chartDarkBackground]
            });

        } catch (err) {
            console.error('[Stock] error:', err);
        }
    }

    async function cargarGraficoIngresos() {
        try {

            const params = new URLSearchParams();

            if (filtros.desde) params.append('desde', filtros.desde);
            if (filtros.hasta) params.append('hasta', filtros.hasta);

            const res = await fetch(`/api/estadisticas/ingresos-mensuales?${params.toString()}`);
            const data = await res.json();

            destroyChart(charts.ingresos);

            charts.ingresos = new Chart(ctx.ingresos, {
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
                        legend: {
                            labels: { color: '#fff' }
                        },
                        title: {
                            display: true,
                            text: 'Ingresos mensuales'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const value = context.parsed.y || 0;
                                    return `Ingresos: $${value.toFixed(2)}`;
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
                            ticks: { color: '#fff' },
                            grid: { color: 'rgba(255,255,255,0.1)' }
                        }
                    }
                },
                plugins: [chartDarkBackground]
            });

        } catch (err) {
            console.error('[Ingresos] error:', err);
        }
    }

    function initFiltros() {

        inputDesde?.addEventListener('change', (e) => {
            filtros.desde = e.target.value;

            if (filtros.desde && filtros.hasta) {
                cargarGraficoPedidos();
                cargarGraficoIngresos();
            }
        });

        inputHasta?.addEventListener('change', (e) => {
            filtros.hasta = e.target.value;

            if (filtros.desde && filtros.hasta) {
                cargarGraficoPedidos();
                cargarGraficoIngresos();
            }
        });

        btnReset?.addEventListener('click', () => {

            filtros.desde = null;
            filtros.hasta = null;

            inputDesde.value = '';
            inputHasta.value = '';

            cargarGraficoPedidos();
            cargarGraficoIngresos();
        });
    }

    function init() {

        const canvasPedidos = document.getElementById('chart-pedidos');
        const canvasStock = document.getElementById('chart-stock');
        const canvasIngresos = document.getElementById('chart-ingresos');

        if (!canvasPedidos || !canvasStock || !canvasIngresos) {
            console.error('Canvas no encontrado');
            return;
        }

        ctx.pedidos = canvasPedidos.getContext('2d');
        ctx.stock = canvasStock.getContext('2d');
        ctx.ingresos = canvasIngresos.getContext('2d');

        initFiltros();

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
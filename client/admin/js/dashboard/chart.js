const GraficosModule = (function () {

    let chartPedidos = null;
    let chartStock = null;

    let ctxPedidos = null;
    let ctxStock = null;

    async function cargarGraficoPedidos() {

        try {

            const res = await fetch('/api/estadisticas/pedidos-semana');
            const data = await res.json();

            const valores = [
                data.pendiente || 0,
                data.hecho || 0,
                data.entregado || 0
            ];

            if (chartPedidos) chartPedidos.destroy();

            chartPedidos = new Chart(ctxPedidos, {
                type: 'doughnut',
                data: {
                    labels: ['Pendientes', 'Hechos', 'Entregados'],
                    datasets: [{
                        data: valores,
                        backgroundColor: [
                            'rgba(255,193,7,0.7)',
                            'rgba(23,162,184,0.7)',
                            'rgba(40,167,69,0.7)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'right', labels: { color: '#fff' } },
                        title: { display: true, text: 'Pedidos por estado', color: '#fff' }
                    }
                }
            });

        } catch (err) {
            console.error('Error pedidos:', err);
        }
    }

    async function cargarGraficoStock() {

        try {

            const res = await fetch('/api/estadisticas/stock-productos');
            const data = await res.json();

            if (chartStock) {
                chartStock.destroy();
            }

            chartStock = new Chart(ctxStock, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Stock por producto',
                        data: data.data,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Stock por producto',
                            color: '#ffffff'
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ffffff'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });

        } catch (err) {
            console.error('Error gráfico stock:', err);
        }
    }

    function init() {

        setTimeout(() => {

            ctxPedidos = document.getElementById('grafica-pedidos')?.getContext('2d');
            ctxStock = document.getElementById('grafica-mis-productos')?.getContext('2d');

            if (!ctxPedidos || !ctxStock) {
                console.error('Canvas no encontrado');
                return;
            }

            cargarGraficoPedidos();
            cargarGraficoStock();

            setTimeout(() => {
                if (chartPedidos) chartPedidos.resize();
                if (chartStock) chartStock.resize();
            }, 200);

        }, 50);
    }

    return {
        init,
        getPedidosChart: () => chartPedidos,
        getStockChart: () => chartStock
    };

})();

document.addEventListener('DOMContentLoaded', () => {
    GraficosModule.init();
});
const gestorPedidos = (() => {

    /* ==============================
       1. ESTADO DEL MODULO
       ============================== */

    let pedidos = [];
    let estados = [];
    console.log('Estado inicial de pedidos:', pedidos);



    /* ==============================
       2. SELECTORES DEL DOM
       ============================== */

    const tablaPedidos = document.querySelector('#tabla-pedidos tbody');



    /* ==============================
       3. FUNCIONES DE DATOS (API)
       ============================== */

    const obtenerPedidos = async () => {

        try {

            const response = await fetch('/api/pedidos');
            const data = await response.json();

            pedidos = data;

            console.log('Estado intermedio de pedidos:', pedidos);

            renderizarPedidos();

        } catch (error) {

            console.error('Error obteniendo pedidos:', error);

        }

    };

    const cambiarEstadoPedido = async (pedidoId, estadoId) => {

        try {

            await fetch(`/api/pedidos/${pedidoId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado_id: estadoId
                })
            });

        } catch (error) {

            console.error('Error actualizando estado:', error);

        }

    };

    const obtenerEstados = async () => {

        try {

            const response = await fetch('/api/estados-pedidos');
            const data = await response.json();

            estados = data;

        } catch (error) {

            console.error('Error obteniendo estados:', error);

        }

    };


    /* ==============================
       4. FUNCIONES DE RENDERIZADO
       ============================== */


    const renderizarPedidos = () => {

        tablaPedidos.innerHTML = '';

        pedidos.forEach(pedido => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.cliente.nombre} ${pedido.cliente.apellido}</td>
            <td>${pedido.fecha}</td>
            <td>
                <select class="estado-pedido" data-id="${pedido.id}">
                    ${estados.map(e => `
                        <option value="${e.id}" ${e.id === pedido.estado_id ? 'selected' : ''}>
                            ${e.nombre}
                        </option>
                    `).join('')}
                </select>
            </td>
            <td><button class="btn btn-info" onclick="mostrarDetallesPedido(${pedido.id})">Ver Detalles</button></td>
            <td>${pedido.total}</td>
        `;

            tablaPedidos.appendChild(fila);

        });

    };

    /* ==============================
       5. FUNCIONES DE CONTROL
       ============================== */


    const cargarPedidos = async () => {
        await obtenerEstados();
        await obtenerPedidos();
    };

    /* ==============================
       6. INICIALIZACION
       ============================== */

    const init = () => {
        cargarPedidos();

        document.addEventListener('change', (e) => {

            if (!e.target.classList.contains('estado-pedido')) return;

            const pedidoId = e.target.dataset.id;
            const estadoId = e.target.value;

            cambiarEstadoPedido(pedidoId, estadoId);

        });
    };

    return { init };

})();

document.addEventListener('DOMContentLoaded', gestorPedidos.init);
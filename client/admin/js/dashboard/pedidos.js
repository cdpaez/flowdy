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
    /**
     * modal detalles pedido
     */
    const modal = document.getElementById('modalActa');
    const contenedorDetalle = document.getElementById('detalleActa');
    const cerrarModalBtn = document.getElementById('cerrarModal');
    /**
     * filtro pedidos por fecha y buscador
     */
    const inputFechaInicio = document.querySelector('#fecha-inicio');
    const inputFechaFin = document.querySelector('#fecha-fin');
    const inputBuscador = document.querySelector('#buscador-ventas');



    /* ==============================
       3. FUNCIONES DE DATOS (API)
       ============================== */

    const obtenerPedidos = async () => {

        try {

            const response = await fetch('/api/pedidos');
            const data = await response.json();

            pedidos = data.map(pedido => ({
                ...pedido,
                timestamp: new Date(pedido.fecha).getTime()
            }));

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


    const renderizarPedidos = (lista = pedidos) => {

        tablaPedidos.innerHTML = '';

        lista.forEach(pedido => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
            
            <td>${pedido.cliente.nombre} ${pedido.cliente.apellido}</td>
            <td>${pedido.cliente.telefono}</td>
            <td>${pedido.cliente.cedula_ruc}</td>
            <td>${formatearFecha(pedido.fecha)}</td>
            <td>
                <select class="estado-pedido" data-id="${pedido.id}">
                    ${estados.map(e => `
                        <option value="${e.id}" ${e.id === pedido.estado_id ? 'selected' : ''}>
                            ${e.nombre}
                        </option>
                    `).join('')}
                </select>
            </td>
            <td>
                <button class="btn btn-info btn-detalle" data-id="${pedido.id}">
                Ver Detalles
                </button>
            </td>
            <td>$${pedido.total}</td>
        `;

            tablaPedidos.appendChild(fila);

        });

    };

    const mostrarDetallesPedido = (pedidoId) => {
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (!pedido) return;
        contenedorDetalle.innerHTML = ` 
            <p><strong>Cliente:</strong> ${pedido.cliente.nombre} ${pedido.cliente.apellido}</p> 
            <h3>Productos</h3> 
            <table class="tabla-detalles"> 
                <thead> 
                    <tr> 
                        <th>Producto</th> 
                        <th>Categoría</th> 
                        <th>Cantidad</th> 
                        <th>Precio</th> 
                        <th>Subtotal</th> 
                    </tr> 
                </thead> 
                <tbody> ${pedido.detalles.map(detalle => ` 
                    <tr> 
                        <td>${detalle.nombre_producto}</td>
                        <td>${detalle.categoria_nombre}</td>
                        <td>${detalle.cantidad}</td>
                        <td>$${detalle.precio_unitario}</td>
                        <td>$${detalle.subtotal}</td>
                    </tr> `).join('')} 
                </tbody> 
            </table> 
            <h3>Total: $${pedido.total}</h3> `;
        modal.classList.remove('hidden');
    };

    /**
     * Convierte fecha ISO a formato legible
     * 2026-04-22T16:00:55.535Z -> 22/04/2026 16:00
     */
    const formatearFecha = (fechaISO) => {

        const fecha = new Date(fechaISO);

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();

        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');

        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    };

    /* ==============================
       5. FUNCIONES DE CONTROL
       ============================== */


    const cerrarModal = () => {
        modal.classList.add('hidden');
    };

    /**
     * Evita ejecutar una función demasiadas veces seguidas
     */
    const debounce = (func, delay = 300) => {

        let timeout;

        return (...args) => {

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);

        };

    };

    const cargarPedidos = async () => {
        await obtenerEstados();
        await obtenerPedidos();
    };

    /**
     * Filtra los pedidos según fecha y texto
     */
    const filtrarPedidos = () => {

        const fechaInicio = inputFechaInicio.value;
        const fechaFin = inputFechaFin.value;
        const textoBusqueda = inputBuscador.value.toLowerCase();

        let inicio = null;
        let fin = null;

        if (fechaInicio) {
            inicio = new Date(fechaInicio + "T00:00:00").getTime();
        }

        if (fechaFin) {
            const fechaFinObj = new Date(fechaFin + "T00:00:00");
            fechaFinObj.setDate(fechaFinObj.getDate() + 1);
            fin = fechaFinObj.getTime();
        }

        const pedidosFiltrados = pedidos.filter(pedido => {

            const fechaPedido = pedido.timestamp;

            if (inicio && fechaPedido < inicio) return false;
            if (fin && fechaPedido >= fin) return false;

            const nombre = pedido.cliente?.nombre?.toLowerCase() || '';
            const cedula = pedido.cliente?.cedula_ruc?.toString() || '';
            const total = pedido.total?.toString() || '';

            const coincideTexto =
                nombre.includes(textoBusqueda) ||
                cedula.includes(textoBusqueda) ||
                total.includes(textoBusqueda);

            return coincideTexto;

        });

        renderizarPedidos(pedidosFiltrados);

    };
    const filtrarPedidosDebounced = debounce(filtrarPedidos, 300);

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

        document.addEventListener('click', (e) => {

            if (!e.target.classList.contains('btn-detalle')) return;

            const pedidoId = e.target.dataset.id;

            mostrarDetallesPedido(pedidoId);

        });
        cerrarModalBtn.addEventListener('click', cerrarModal);

        inputFechaInicio.addEventListener('change', filtrarPedidos);
        inputFechaFin.addEventListener('change', filtrarPedidos);
        inputBuscador.addEventListener('input', filtrarPedidosDebounced);

    };

    return { init };

})();

document.addEventListener('DOMContentLoaded', gestorPedidos.init);
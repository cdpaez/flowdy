const gestorPedidos = (() => {

    /* ==============================
       1. ESTADO DEL MODULO
       ============================== */
    let pedidos = [];
    let estados = [];

    /* ==============================
       2. SELECTORES DEL DOM
       ============================== */
    const tablaPedidos = document.querySelector('#tabla-pedidos tbody');
    const modal = document.getElementById('modalPedidos');
    const contenedorDetalle = document.getElementById('detallePedidos');
    const cerrarModalBtn = document.getElementById('cerrarModal');
    const inputFechaInicio = document.querySelector('#fecha-inicio');
    const inputFechaFin = document.querySelector('#fecha-fin');
    const inputBuscador = document.querySelector('#buscador-pedidos');

    /* ==============================
       3. FUNCIONES DE DATOS (API)
       ============================== */

    const obtenerPedidos = async () => {
        try {
            const response = await fetch('/api/pedidos');
            const data = await response.json();

            // 🔥 NUEVA ESTRUCTURA: data.success y data.pedidos
            if (data.success && Array.isArray(data.pedidos)) {
                pedidos = data.pedidos.map(pedido => {

                    const estadoObj = estados.find(e =>
                        e.nombre.toLowerCase() === pedido.estado.toLowerCase()
                    );

                    return {
                        ...pedido,
                        id: pedido.pedido_id,
                        estado_id: estadoObj ? estadoObj.id : null,
                        timestamp: new Date(pedido.fecha).getTime(),
                        cliente: pedido.cliente_en_momento
                    };
                });

                console.log('Primer pedido mapeado:', pedidos[0]);
                console.log('ID del primer pedido:', pedidos[0]?.id);
            } else {
                pedidos = [];
            }

            console.log('Pedidos cargados:', pedidos);
            renderizarPedidos();

        } catch (error) {
            console.error('Error obteniendo pedidos:', error);
            tablaPedidos.innerHTML = '<tr><td colspan="7">Error cargando pedidos</td></tr>';
        }
    };

    const cambiarEstadoPedido = async (pedidoId, estadoId) => {
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado_id: parseInt(estadoId)
                })
            });

            if (!response.ok) {
                throw new Error('Error actualizando estado');
            }

            // Actualizar el estado localmente sin recargar todo
            const pedido = pedidos.find(p => p.id === parseInt(pedidoId));
            if (pedido) {
                pedido.estado_id = parseInt(estadoId);
                const estadoNombre = estados.find(e => e.id === parseInt(estadoId))?.nombre || 'Desconocido';
                pedido.estado = { nombre: estadoNombre };
            }

        } catch (error) {
            console.error('Error actualizando estado:', error);
            alert('Error al actualizar el estado del pedido');
        }
    };

    const obtenerEstados = async () => {
        try {
            const response = await fetch('/api/estados-pedidos');
            const data = await response.json();
            estados = Array.isArray(data) ? data : data.estados || [];
        } catch (error) {
            console.error('Error obteniendo estados:', error);
            estados = [];
        }
    };

    /* ==============================
       4. FUNCIONES DE RENDERIZADO
       ============================== */

    const renderizarPedidos = (lista = pedidos) => {
        if (!tablaPedidos) return;

        if (lista.length === 0) {
            tablaPedidos.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay pedidos registrados</td></tr>';
            return;
        }

        tablaPedidos.innerHTML = '';

        lista.forEach(pedido => {
            const fila = document.createElement('tr');
            const clienteData = pedido.cliente || pedido.cliente_en_momento || {};

            fila.innerHTML = `
                <td>${clienteData.nombre || ''} ${clienteData.apellido || ''}</td>
                <td>${clienteData.telefono || ''}</td>
                <td>${clienteData.cedula || clienteData.cedula_ruc || ''}</td>
                <td>${formatearFecha(pedido.fecha)}</td>
                <td>
                    <select class="estado-pedido" data-id="${pedido.id}">
                        ${estados.map(e => `
                            <option value="${e.id}" ${parseInt(e.id) === parseInt(pedido.estado_id) ? 'selected' : ''}>
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
                <td>$${parseFloat(pedido.total).toFixed(2)}</td>
            `;

            tablaPedidos.appendChild(fila);
        });

        // Reasignar eventos después de renderizar
        asignarEventosSelects();
    };

    const asignarEventosSelects = () => {
        document.querySelectorAll('.estado-pedido').forEach(select => {
            // Remover event listener anterior para evitar duplicados
            select.removeEventListener('change', handleEstadoChange);
            select.addEventListener('change', handleEstadoChange);
        });

        document.querySelectorAll('.btn-detalle').forEach(btn => {
            btn.removeEventListener('click', handleDetalleClick);
            btn.addEventListener('click', handleDetalleClick);
        });
    };

    const handleEstadoChange = (e) => {
        const pedidoId = e.target.dataset.id;
        const estadoId = e.target.value;
        cambiarEstadoPedido(pedidoId, estadoId);
    };

    const handleDetalleClick = (e) => {
        // Buscar el botón hacia arriba si el clic fue en un hijo
        const boton = e.target.closest('.btn-detalle');
        if (!boton) return;

        const pedidoId = boton.dataset.id;
        if (!pedidoId) {
            console.error('No se encontró el ID del pedido');
            return;
        }

        mostrarDetallesPedido(pedidoId);
    };

    const mostrarDetallesPedido = async (pedidoId) => {
        try {
            // 🔥 Obtener detalles frescos desde el API para asegurar datos correctos
            const response = await fetch(`/api/pedidos/${pedidoId}`);
            const data = await response.json();

            let pedido;
            if (data.success) {
                pedido = data.pedido;
            } else {
                pedido = pedidos.find(p => p.id == pedidoId);
            }

            if (!pedido) return;

            const clienteData = pedido.cliente_en_momento || pedido.cliente || {};

            contenedorDetalle.innerHTML = ` 
                <div class="detalle-cliente">
                    <h3>Datos del Cliente (al momento del pedido)</h3>
                    <p><strong>Nombre:</strong> ${clienteData.nombre || ''} ${clienteData.apellido || ''}</p>
                    <p><strong>Teléfono:</strong> ${clienteData.telefono || ''}</p>
                    <p><strong>Email:</strong> ${clienteData.email || ''}</p>
                    <p><strong>Cédula/RUC:</strong> ${clienteData.cedula || clienteData.cedula_ruc || ''}</p>
                    <p><strong>Dirección de entrega:</strong> ${pedido.direccion_entrega || ''}</p>
                    <p><strong>Fecha del pedido:</strong> ${formatearFecha(pedido.fecha)}</p>
                </div>
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
                    <tbody> 
                        ${(pedido.detalles || []).map(detalle => ` 
                            <tr> 
                                <td>${detalle.nombre_producto || detalle.producto_nombre || ''}</td>
                                <td>${detalle.categoria_nombre || ''}</td>
                                <td>${detalle.cantidad}</td>
                                <td>$${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                                <td>$${parseFloat(detalle.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')} 
                    </tbody> 
                </table> 
                <h3>Total: $${parseFloat(pedido.total).toFixed(2)}</h3>
                <p><small>⚠️ Los datos del cliente reflejan la información al momento de la compra</small></p>
            `;

            modal.classList.remove('hidden');

        } catch (error) {
            console.error('Error mostrando detalles:', error);
            alert('Error al cargar los detalles del pedido');
        }
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Fecha no disponible';
        const fecha = new Date(fechaISO);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');

        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    };

    const cerrarModal = () => {
        if (modal) modal.classList.add('hidden');
    };

    const debounce = (func, delay = 300) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const cargarPedidos = async () => {
        await obtenerEstados();
        await obtenerPedidos();
    };

    const filtrarPedidos = () => {
        const fechaInicio = inputFechaInicio?.value;
        const fechaFin = inputFechaFin?.value;
        const textoBusqueda = inputBuscador?.value.toLowerCase() || '';

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

            const clienteData = pedido.cliente || {};
            const nombre = (clienteData.nombre || '').toLowerCase();
            const apellido = (clienteData.apellido || '').toLowerCase();
            const cedula = (clienteData.cedula || clienteData.cedula_ruc || '').toString().toLowerCase();
            const total = pedido.total?.toString() || '';

            const coincideTexto = nombre.includes(textoBusqueda) ||
                apellido.includes(textoBusqueda) ||
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

        if (cerrarModalBtn) {
            cerrarModalBtn.addEventListener('click', cerrarModal);
        }

        if (inputFechaInicio) {
            inputFechaInicio.addEventListener('change', filtrarPedidos);
        }

        if (inputFechaFin) {
            inputFechaFin.addEventListener('change', filtrarPedidos);
        }

        if (inputBuscador) {
            inputBuscador.addEventListener('input', filtrarPedidosDebounced);
        }

        // Cerrar modal al hacer clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cerrarModal();
            });
        }
    };

    return { init };

})();

document.addEventListener('DOMContentLoaded', gestorPedidos.init);
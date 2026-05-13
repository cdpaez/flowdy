const GestorProductos = (() => {

    /* ==============================
       1. ESTADO DEL MODULO
       ============================== */
    let todosLosProductos = [];
    let paginaActual = 1;
    const productosPorPagina = 10;
    let busquedaAvanzadaRealizada = false;

    /* ==============================
       2. SELECTORES DEL DOM
       ============================== */

    const tablaProductos = document.querySelector('.tabla-productos tbody');

    /* ==============================
       3. FUNCIONES DE DATOS (API)
       ============================== */

    const cargarCategorias = async () => {
        try {

            const res = await fetch('/api/categorias');
            const categorias = await res.json();

            const select = document.getElementById('categoria_id');

            select.innerHTML = '<option value="">Seleccionar categoría</option>';

            categorias.forEach(categoria => {

                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;

                select.appendChild(option);

            });

        } catch (error) {

            console.error(error);
            mostrarToast('❌ Error cargando categorías', 'error');

        }
    };

    const cargarProductos = async () => {
        try {
            const res = await fetch('/api/productos');

            if (!res.ok) {
                throw new Error('Error al obtener productos');
            }

            todosLosProductos = await res.json();

            mostrarProductos(todosLosProductos);

        } catch (error) {
            console.error(error);

            tablaProductos.innerHTML = `
            <tr>
                <td colspan="11">Error al cargar productos: ${error.message}</td>
            </tr>
        `;

            mostrarToast('❌ Error al cargar productos', 'error');
        }
    };

    const editarProducto = async (id) => {
        try {

            const token = sessionStorage.getItem('token');

            const res = await fetch(`/api/productos/${id}`, {
                headers: { Authorization: token }
            });

            const producto = await res.json();

            const form = document.getElementById('form-modal-producto');

            form.dataset.modo = 'edicion';
            form.dataset.id = id;

            document.getElementById('titulo-modal-producto').textContent = 'Editar Producto';

            // cargar datos en el formulario
            document.getElementById('nombre').value = producto.nombre || '';
            document.getElementById('categoria_id').value = producto.categoria_id || '';
            document.getElementById('descripcion').value = producto.descripcion || '';
            document.getElementById('precio').value = producto.precio || '';
            document.getElementById('stock').value = producto.stock || '';

            document.getElementById('es_nuevo').checked = producto.es_nuevo || false;
            document.getElementById('es_popular').checked = producto.es_popular || false;

            document.getElementById('modal-producto').style.display = 'flex';

        } catch (e) {

            console.error(e);
            mostrarToast(`❌ ${e.message}`, 'error');

        }
    };

    const eliminarProducto = async (id) => {
        const confirm = await confirmarEliminacion();
        if (!confirm) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/api/productos/${id}`, {
                method: 'DELETE',
                headers: { Authorization: token }
            });
            if (!res.ok) throw new Error('Error al eliminar');
            mostrarToast('✅ Producto eliminado correctamente', 'success');
            cargarProductos();
        } catch (e) {
            mostrarToast(`❌ ${e.message}`, 'error');
        }
    };

    const confirmarEliminacion = () => {
        return new Promise(resolve => {
            const toast = document.createElement('div');
            toast.className = 'toast-confirm';
            toast.innerHTML = `
        <div class="toast-confirm-content">
          <p>¿Eliminar este producto?</p>
          <div class="toast-confirm-buttons">
            <button id="toast-confirmar">Sí, eliminar</button>
            <button id="toast-cancelar">Cancelar</button>
          </div>
        </div>`;
            document.body.appendChild(toast);
            document.getElementById('toast-confirmar').addEventListener('click', () => { toast.remove(); resolve(true); });
            document.getElementById('toast-cancelar').addEventListener('click', () => { toast.remove(); resolve(false); });
        });
    };

    const manejarSubmitProducto = async (e) => {
        e.preventDefault();

        const form = e.target;
        const esEdicion = form.dataset.modo === 'edicion';
        const token = sessionStorage.getItem('token');

        const loader = document.getElementById('loader-modal');

        try {
            loader.style.display = 'block';
            form.querySelector('button[type="submit"]').disabled = true;

            const datos = new FormData();

            datos.append('nombre', document.getElementById('nombre').value);
            datos.append('categoria_id', document.getElementById('categoria_id').value);
            datos.append('descripcion', document.getElementById('descripcion').value);
            datos.append('precio', document.getElementById('precio').value);
            datos.append('stock', document.getElementById('stock').value);

            datos.append('es_nuevo', document.getElementById('es_nuevo').checked);
            datos.append('es_popular', document.getElementById('es_popular').checked);

            const fileInput = document.getElementById('imagen');
            if (fileInput.files[0]) {
                datos.append('imagen', fileInput.files[0]);
            }

            const url = esEdicion
                ? `/api/productos/${form.dataset.id}`
                : `/api/productos`;

            const method = esEdicion ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: token
                },
                body: datos
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error en la operación');
            }

            const result = await res.json();

            mostrarToast(
                esEdicion
                    ? '✅ Producto actualizado correctamente'
                    : '✅ Producto creado correctamente',
                'success'
            );

            cerrarModal();
            cargarProductos();

        } catch (error) {
            console.error(error);
            mostrarToast(`❌ ${error.message}`, 'error');

        } finally {
            loader.style.display = 'none';
            form.querySelector('button[type="submit"]').disabled = false;
        }
    };

    const importarProductos = async (e) => {
        e.preventDefault();
        const form = e.target;
        const fileInput = form.archivo;
        const token = sessionStorage.getItem('token');
        if (!fileInput.files.length) {
            mostrarToast('❌ Selecciona un archivo', 'error');
            return;
        }
        try {
            const loader = document.createElement('div');
            loader.className = 'loader';
            form.appendChild(loader);
            form.querySelector('button[type="submit"]').disabled = true;
            const formData = new FormData();
            formData.append('archivo', fileInput.files[0]);
            const res = await fetch(`/equipos/importar`, {
                method: 'POST',
                headers: { Authorization: token },
                body: formData
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Error al importar');
            mostrarToast(`✅ Importados ${result.importados} de ${result.total} productos`, 'success');
            document.getElementById('modal-importar').style.display = 'none';
            cargarProductos();
        } catch (e) {
            mostrarToast(`❌ ${e.message}`, 'error');
        } finally {
            form.reset();
            form.querySelector('.loader')?.remove();
            form.querySelector('button[type="submit"]').disabled = false;
        }
    };

    /* ==============================
       4. FUNCIONES DE RENDERIZADO
       ============================== */
    const mostrarProductos = (productos) => {
        console.log(productos);
        tablaProductos.innerHTML = '';

        if (productos.length === 0) {
            tablaProductos.innerHTML = '<tr><td colspan="11">No se encontraron productos</td></tr>';
            return;
        }

        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;

        productos.slice(inicio, fin).forEach(p => {

            const estadoStock = p.stock > 0 ? 'stock-disponible' : 'stock-agotado';
            const nuevo = p.es_nuevo ? '⭐' : '❌';
            const popular = p.es_popular ? '🔥' : '❌';

            const fila = document.createElement('tr');

            fila.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.categoria?.nombre || '-'}</td>
        <td>${p.descripcion ?? ''}</td>
        <td>$${p.precio}</td>
        <td class="${estadoStock}">${p.stock}</td>
        <td>
            ${p.imagen ? `<img src="${p.imagen}" width="50">` : '—'}
        </td>
        <td>${nuevo}</td>
        <td>${popular}</td>
        <td>
            <input 
                type="checkbox" 
                class="toggle-activo" 
                data-id="${p.id}" 
                ${p.activo ? 'checked' : ''}
            >
        </td>
        <td class="acciones">
            <button class="btn-editar" data-id="${p.id}">✏️</button>
            <button class="btn-eliminar" data-id="${p.id}">🗑️</button>
        </td>
        `;

            tablaProductos.appendChild(fila);
        });

        asignarEventosBotones();
        asignarEventosToggleActivo();
        mostrarPaginacion(productos);
    };

    const mostrarToast = (mensaje, tipo = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const mostrarContador = (total, disponibles, vendidos) => {
        document.getElementById('contadorResultados').textContent = `${total} resultados encontrados`;
        document.getElementById('contadorDisponibles').textContent = `${disponibles} Disponibles`;
        document.getElementById('contadorVendidos').textContent = `${vendidos} Vendidos`;
    };


    /* ==============================
       5. FUNCIONES DE CONTROL
       ============================== */

    const conectarWebSocket = () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const protocolo = location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${protocolo}://${location.host}/ws?token=${token}`);

        ws.addEventListener('open', () => {
            console.log('[WS] Conexión establecida');
        });

        ws.addEventListener('message', (event) => {
            try {
                const mensaje = JSON.parse(event.data);

                if (mensaje.type === 'venta_realizada') {
                    console.log('[WS] Venta realizada - actualizando productos...');
                    // ⚡️ Llamar a cargarProductos para refrescar tabla
                    cargarProductos();
                    mostrarToast('📦 Venta realizada - tabla actualizada', 'success');
                }

            } catch (e) {
                console.error('[WS] Error procesando mensaje:', e);
            }
        });

        ws.addEventListener('close', (e) => {
            console.warn(`[WS] Conexión cerrada (${e.code}): ${e.reason}`);
        });

        ws.addEventListener('error', (e) => {
            console.error('[WS] Error en WebSocket:', e);
        });
    };

    const abrirModalCreacion = () => {
        const form = document.getElementById('form-modal-producto');
        form.reset();
        form.dataset.modo = 'creacion';
        form.removeAttribute('data-id');
        document.getElementById('titulo-modal-producto').textContent = 'Agregar Nuevo Producto';
        document.getElementById('modal-producto').style.display = 'flex';
        document.getElementById('nombre').focus();
    };

    const cerrarModal = () => {
        document.getElementById('modal-producto').style.display = 'none';
        document.getElementById('form-modal-producto').reset();
    };

    const cerrarModalImportar = (e) => {
        const modal = document.getElementById('modal-importar');
        if (e.target === modal || e.target.classList.contains('cerrar-modal')) {
            modal.style.display = 'none';
        }
    };

    const cerrarModalEscape = (e) => {
        if (e.key === 'Escape') {
            document.getElementById('modal-importar').style.display = 'none';
        }
    };

    const manejarDialogoBusqueda = () => {
        const dialogo = document.getElementById("dialogoBusqueda");
        const abrir = document.getElementById("abrirDialogo");
        const cerrar = document.getElementById("cerrarDialogo");

        abrir.addEventListener("click", () => dialogo.showModal());
        cerrar.addEventListener("click", () => dialogo.close());
        dialogo.addEventListener("click", (e) => {
            const rect = dialogo.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                dialogo.close();
            }
        });
    };

    const asignarEventosBotones = () => {
        document.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', () => editarProducto(btn.dataset.id)));
        document.querySelectorAll('.btn-eliminar').forEach(btn => btn.addEventListener('click', () => eliminarProducto(btn.dataset.id)));
    };

    const mostrarPaginacion = (productos) => {
        const totalPaginas = Math.ceil(productos.length / productosPorPagina);
        const contenedor = document.getElementById('paginacion');
        contenedor.innerHTML = '';
        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === paginaActual) btn.classList.add('activa');
            btn.addEventListener('click', () => {
                paginaActual = i;
                mostrarProductos(productos);
            });
            contenedor.appendChild(btn);
        }
    };

    const buscarProductos = (e) => {
        const termino = e.target.value.toLowerCase().trim();
        const resultados = !termino
            ? todosLosProductos
            : todosLosProductos.filter(p =>
                p.nombre.toLowerCase().includes(termino) ||
                p.precio.toString().includes(termino)
            );
        paginaActual = 1;
        mostrarProductos(resultados);
    };

    const filtrarProductos = () => {
        const filtros = ['marca', 'modelo', 'procesador', 'tamano', 'disco', 'ram'].reduce((acc, f) => {
            acc[f] = document.getElementById(`filtro${f.charAt(0).toUpperCase() + f.slice(1)}`).value.toLowerCase();
            return acc;
        }, {});
        const resultados = todosLosProductos.filter(p =>
            (!filtros.marca || p.marca.toLowerCase().includes(filtros.marca)) &&
            (!filtros.modelo || p.modelo.toLowerCase().includes(filtros.modelo)) &&
            (!filtros.procesador || p.procesador.toLowerCase().includes(filtros.procesador)) &&
            (!filtros.tamano || p.tamano.includes(filtros.tamano)) &&
            (!filtros.disco || p.disco.toLowerCase().includes(filtros.disco)) &&
            (!filtros.ram || p.memoria_ram.toLowerCase().includes(filtros.ram))
        );
        busquedaAvanzadaRealizada = true;
        paginaActual = 1;
        mostrarProductos(resultados);
        mostrarContador(resultados.length, resultados.filter(p => p.stock === 'disponible').length, resultados.filter(p => p.stock === 'vendido').length);
    };

    const limpiarBusqueda = () => {
        if (!busquedaAvanzadaRealizada) return;
        document.querySelectorAll('.busqueda-avanzada input').forEach(i => i.value = '');
        paginaActual = 1;
        mostrarProductos(todosLosProductos);
        mostrarContador(todosLosProductos.length, todosLosProductos.filter(p => p.stock === 'disponible').length, todosLosProductos.filter(p => p.stock === 'vendido').length);
        busquedaAvanzadaRealizada = false;
    };

    const initPreviewImagen = () => {
        const inputImagen = document.getElementById('imagen');
        const preview = document.getElementById('preview-imagen');

        if (!inputImagen || !preview) return;

        inputImagen.addEventListener('change', (e) => {
            const file = e.target.files[0];

            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            } else {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    };

    const asignarEventosToggleActivo = () => {

        document.querySelectorAll('.toggle-activo').forEach(check => {

            check.addEventListener('change', async (e) => {

                const id = e.target.dataset.id;
                const activo = e.target.checked;

                try {

                    await fetch(`/api/productos/${id}/activo`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ activo })
                    });

                } catch (error) {
                    console.error('Error actualizando estado', error);
                }

            });

        });

    };
    /* ==============================
       6. INICIALIZACION
       ============================== */
    const init = () => {
        initPreviewImagen();
        document.getElementById('abrir-modal').addEventListener('click', abrirModalCreacion);
        document.getElementById('form-modal-producto').addEventListener('submit', manejarSubmitProducto);
        document.querySelector('.cerrar-modal').addEventListener('click', cerrarModal);
        // TODO: desarrollar la logica para el modal de importacion
        document.addEventListener('keydown', cerrarModalEscape);
        
        document.getElementById('buscador-productos').addEventListener('input', buscarProductos);
        
        cargarCategorias();
        cargarProductos();
        conectarWebSocket();

    };

    return { init };

})();

document.addEventListener('DOMContentLoaded', GestorProductos.init);

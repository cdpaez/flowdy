const UsuariosModule = (() => {
    const state = {
        modo: 'crear',
        usuarioActual: null,
        cargando: false,
        usuarios: [],
        usuariosFiltrados: []
    };

    // Elementos del DOM
    let abrirModalBtn, modal, formulario, cerrarModalBtns, tituloModal, btnSubmit;
    let buscador, filtroEstado, tablaBody;

    // --------------------- INICIALIZACIÓN ---------------------
    const init = () => {
        abrirModalBtn = document.getElementById('abrir-modal-usuario');
        modal = document.getElementById('modal-agregar-usuario');
        formulario = document.getElementById('form__usuario');
        cerrarModalBtns = document.querySelectorAll('.cerrar-modal');
        tituloModal = document.getElementById('titulo-modal-usuario');
        btnSubmit = formulario.querySelector('button[type="submit"]');
        buscador = document.getElementById('buscador-usuarios');
        filtroEstado = document.getElementById('filtro-estado');
        tablaBody = document.querySelector('.tabla-usuarios tbody');

        // Event listeners
        abrirModalBtn.addEventListener('click', abrirModal);
        cerrarModalBtns.forEach(btn => btn.addEventListener('click', cerrarModal));
        window.addEventListener('click', e => e.target === modal && cerrarModal());
        formulario.addEventListener('submit', manejarEnvioFormulario);
        buscador.addEventListener('input', filtrarUsuarios);
        filtroEstado.addEventListener('change', filtrarUsuarios);
        document.addEventListener('click', manejarClicksGlobales);

        obtenerUsuarios();
    };

    const abrirModal = () => {
        state.modo = 'crear';
        tituloModal.textContent = 'Nuevo Usuario';
        formulario.reset();
        document.getElementById('contrasena-usuario').setAttribute('required', '');
        modal.style.display = 'flex';
    };

    const cerrarModal = () => {
        formulario.reset();
        document.getElementById('contrasena-usuario').setAttribute('required', '');
        modal.style.display = 'none';
        state.usuarioActual = null;
        state.modo = 'crear';
        tituloModal.textContent = 'Nuevo Usuario';
    };

    const manejarClicksGlobales = (e) => {
        if (e.target.classList.contains('btn-editar-usuario')) {
            cargarParaEdicion(e.target.getAttribute('data-id'));
        }

        if (e.target.classList.contains('btn-eliminar-usuario')) {
            eliminarUsuario(e.target.getAttribute('data-id'));
        }
    };

    const mostrarToast = (mensaje, tipo = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const setLoading = (isLoading) => {
        state.cargando = isLoading;
        btnSubmit.innerHTML = isLoading
            ? '<span class="spinner"></span> Procesando...'
            : 'Guardar';
        btnSubmit.disabled = isLoading;
    };

    const validarFormulario = () => {
        const nombre = document.getElementById('nombre-usuario').value.trim();
        const correo = document.getElementById('correo-usuario').value.trim();
        const rol = document.getElementById('rol-usuario').value;
        const password = document.getElementById('contrasena-usuario').value;

        if (!nombre || !correo || !rol) {
            mostrarToast('Todos los campos son obligatorios', 'error');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            mostrarToast('Correo electrónico inválido', 'error');
            return false;
        }

        if (state.modo === 'crear' && !password) {
            mostrarToast('La contraseña es obligatoria', 'error');
            return false;
        }

        return true;
    };

    const manejarEnvioFormulario = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;
        setLoading(true);

        try {
            const formData = {
                nombre: document.getElementById('nombre-usuario').value.trim(),
                correo: document.getElementById('correo-usuario').value.trim(),
                rol_usuario: document.getElementById('rol-usuario').value.toLowerCase(),
                ...(document.getElementById('contrasena-usuario').value && {
                    password: document.getElementById('contrasena-usuario').value
                })
            };

            const token = sessionStorage.getItem('token');
            const method = state.modo === 'crear' ? 'POST' : 'PUT';
            const endpoint = state.modo === 'crear'
                ? '/usuarios/crear'
                : `/usuarios/actualizar/${state.usuarioActual.id}`;

            if (method === 'PUT' && formData.correo === state.usuarioActual.correo) {
                delete formData.correo;
            }

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje || 'Error en la operación');

            mostrarToast(state.modo === 'crear' ? '✅ Usuario creado' : '✏️ Usuario actualizado', 'success');
            cerrarModal();
            await obtenerUsuarios();

        } catch (err) {
            mostrarToast(`❌ ${err.message}`, 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const obtenerUsuarios = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('/usuarios/obtener', {
                method: 'GET',
                headers: { 'Authorization': token }
            });

            const usuarios = await res.json();
            if (!res.ok || !Array.isArray(usuarios)) throw new Error('Error al cargar usuarios');

            state.usuarios = usuarios;
            filtrarUsuarios();

        } catch (err) {
            mostrarToast("⚠️ Error al cargar usuarios", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtrarUsuarios = () => {
        const busqueda = buscador.value.toLowerCase();
        const estado = filtroEstado.value;

        state.usuariosFiltrados = state.usuarios.filter(usuario => {
            const matchNombre = usuario.nombre.toLowerCase().includes(busqueda);
            const matchCorreo = usuario.correo.toLowerCase().includes(busqueda);
            const matchEstado = estado ? usuario.estado === estado : true;
            return (matchNombre || matchCorreo) && matchEstado;
        });

        if (state.usuariosFiltrados.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="7">No se encontraron usuarios</td></tr>';
        } else {
            renderizarUsuarios();
        }
    };

    const renderizarUsuarios = () => {
        tablaBody.innerHTML = '';
        state.usuariosFiltrados.forEach(usuario => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.correo}</td>
        <td><span class="badge ${usuario.rol_usuario}">${usuario.rol_usuario}</span></td>
        <td class="estado-toggle">
          <label class="switch">
            <input type="checkbox" ${usuario.estado === 'activo' ? 'checked' : ''} data-id="${usuario.id}">
            <span class="slider round"></span>
            <span class="estado-texto">${usuario.estado}</span>
          </label>
        </td>
        <td class="acciones">
          <button class="btn-editar-usuario" data-id="${usuario.id}">✏️ Editar</button>
          <button class="btn-eliminar-usuario" data-id="${usuario.id}">🗑️ Eliminar</button>
        </td>
      `;
            tablaBody.appendChild(fila);
        });

        document.querySelectorAll('.estado-toggle input').forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nuevoEstado = e.target.checked ? 'activo' : 'inactivo';
                const usuarioActualizado = await cambiarEstadoUsuario(id, nuevoEstado);

                if (usuarioActualizado) {
                    const index = state.usuarios.findIndex(u => u.id == id);
                    if (index !== -1) state.usuarios[index].estado = usuarioActualizado.estado;

                    const textoEstado = e.target.parentElement.querySelector('.estado-texto');
                    textoEstado.textContent = usuarioActualizado.estado;
                    textoEstado.className = `estado-texto ${usuarioActualizado.estado}`;
                } else {
                    e.target.checked = !e.target.checked;
                }
            });
        });
    };

    const cambiarEstadoUsuario = async (id, nuevoEstado) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/usuarios/cambiar-estado/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            const data = await res.json();
            if (!res.ok) throw new Error('Error al cambiar estado');

            mostrarToast(`Estado cambiado a ${nuevoEstado}`, nuevoEstado === 'activo' ? 'success' : 'warning');
            return data.usuario;

        } catch (err) {
            mostrarToast(`Error: ${err.message}`, 'error');
            return null;
        }
    };

    const cargarParaEdicion = async (id) => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/usuarios/obtener/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            const usuario = await res.json();
            if (!res.ok) throw new Error('Usuario no encontrado');

            state.usuarioActual = usuario;
            state.modo = 'editar';

            document.getElementById('nombre-usuario').value = usuario.nombre;
            document.getElementById('correo-usuario').value = usuario.correo;
            document.getElementById('rol-usuario').value = usuario.rol_usuario;
            document.getElementById('contrasena-usuario').value = '';
            document.getElementById('contrasena-usuario').removeAttribute('required');

            tituloModal.textContent = 'Editar Usuario';
            modal.style.display = 'flex';

        } catch (err) {
            mostrarToast(`❌ ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const eliminarUsuario = async (id) => {
        const confirmarEliminacion = () => {
            return new Promise((resolve) => {
                const toast = document.createElement('div');
                toast.className = 'toast-confirm';
                toast.innerHTML = `
          <div class="toast-confirm-content">
            <p>¿Eliminar este producto?</p>
            <div class="toast-confirm-buttons">
              <button id="toast-confirmar">Sí, eliminar</button>
              <button id="toast-cancelar">Cancelar</button>
            </div>
          </div>
        `;
                document.body.appendChild(toast);
                document.getElementById('toast-confirmar').addEventListener('click', () => {
                    toast.remove();
                    resolve(true);
                });
                document.getElementById('toast-cancelar').addEventListener('click', () => {
                    toast.remove();
                    resolve(false);
                });
            });
        };

        const confirmado = await confirmarEliminacion();
        if (!confirmado) return;

        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/usuarios/eliminar/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Error al eliminar');
            mostrarToast('🗑️ Usuario eliminado correctamente', 'success');
            await obtenerUsuarios();

        } catch (err) {
            mostrarToast(`❌ ${err.message}`, 'error');
        }
    };

    // Público
    return {
        init
    };
})();

// Iniciar cuando esté listo el DOM
document.addEventListener('DOMContentLoaded', UsuariosModule.init);

const ActasModule = (function () {
    let actasOriginales = [];

    // Elementos DOM (cacheados)
    const modalActa = document.getElementById('modalActa');
    const cerrarModalBtn = document.getElementById('cerrarModal');
    const tablaActas = document.getElementById('tabla-actas');
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    const buscadorVentas = document.getElementById('buscador-ventas');
    const detalleActa = document.getElementById('detalleActa');

    // Inicialización de eventos
    function initEventos() {
        // Abrir modal con datos del acta
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ver-acta-btn')) {
                const id = e.target.getAttribute('data-id');
                verActa(id);
                modalActa.classList.remove('hidden');
            }

            if (e.target && e.target.id === 'descargarActaPDF') {
                descargarPDF();
            }
        });

        // Cerrar modal
        cerrarModalBtn.addEventListener('click', () => {
            modalActa.classList.add('hidden');
        });
        modalActa.addEventListener('click', (e) => {
            if (e.target === modalActa) {
                modalActa.classList.add('hidden');
            }
        });

        // Filtros
        fechaInicio.addEventListener('change', aplicarFiltros);
        fechaFin.addEventListener('change', aplicarFiltros);
        buscadorVentas.addEventListener('input', aplicarFiltros);
    }

    // Cargar actas desde backend
    async function cargarTablaActas() {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('/actas/resumen', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const error = await res.json();
                console.error('Error al obtener actas:', error);
                alert('❌ Error al cargar el resumen de actas');
                return;
            }

            const actas = await res.json();
            if (!Array.isArray(actas)) {
                console.error('Respuesta inválida:', actas);
                alert('❌ La respuesta del servidor no es válida');
                return;
            }

            actasOriginales = actas;
            renderizarTablaActas(actasOriginales);

        } catch (error) {
            console.error('❌ Error de red o procesamiento:', error);
            alert('❌ No se pudo conectar con el servidor');
        }
    }

    // Renderizar tabla
    function renderizarTablaActas(lista) {
        tablaActas.innerHTML = '';
        if (lista.length === 0) {
            tablaActas.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 1rem; color: #666;">
          🛈 No existen actas registradas en ese rango de fechas.
        </td>
      </tr>`;
            return;
        }

        lista.forEach(acta => {
            const fila = `
      <tr>
        <td>${acta.id}</td>
        <td>${new Date(acta.fecha_registro).toLocaleDateString()}</td>
        <td>${acta.cliente_nombre || 'Sin cliente'} - ${acta.cliente_cedula || 'Sin cedula'}</td>
        <td>${acta.equipo_marca || ''} ${acta.equipo_modelo || ''} - ${acta.equipo_codigo_prd || 'sin codigo'}</td>
        <td>${acta.vendedor_nombre || ''}</td>
        <td>${acta.forma_pago}</td>
        <td>$${Number(acta.precio).toFixed(2)}</td>
        <td><button class="ver-acta-btn" data-id="${acta.id}">Ver</button></td>
      </tr>`;
            tablaActas.innerHTML += fila;
        });
    }

    function booleanToCheckIcon(value) {
        return value ? '✅' : '❌';
    }

    // Mostrar detalle del acta en el modal
    async function verActa(id) {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`/actas/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const acta = await res.json();

            const hw = acta.inspeccion_hw || {};
            const sw = acta.inspeccion_sw || {};
            const ad = acta.adicionales || {};

            const detalle = `
        <p><strong>Fecha:</strong> ${new Date(acta.fecha_registro).toLocaleString()}</p>
        <p><strong>Cliente:</strong> ${acta.cliente_nombre} - ${acta.cliente_cedula}</p>
        <p><strong>Equipo:</strong> ${acta.equipo_marca} ${acta.equipo_modelo} - Serie: ${acta.equipo_numero_serie}</p>
        <p><strong>Vendedor:</strong> ${acta.vendedor_nombre}</p>
        <p><strong>Forma de pago:</strong> ${acta.forma_pago}</p>
        <p><strong>Precio:</strong> $${Number(acta.precio).toFixed(2)}</p>
        <p><strong>Observaciones:</strong> ${acta.observaciones || 'Ninguna'}</p>

        <h3>Inspección de Hardware</h3>
        <ul>
          <li>Teclado: ${booleanToCheckIcon(hw.teclado_estado)} — ${hw.teclado_observacion || 'aprobado'}</li>
          <li>Mouse: ${booleanToCheckIcon(hw.mouse_estado)} — ${hw.mouse_observacion || 'aprobado'}</li>
          <li>Cámara: ${booleanToCheckIcon(hw.camara_estado)} — ${hw.camara_observacion || 'aprobado'}</li>
          <li>Pantalla: ${booleanToCheckIcon(hw.pantalla_estado)} — ${hw.pantalla_observacion || 'aprobado'}</li>
          <li>Parlantes: ${booleanToCheckIcon(hw.parlantes_estado)} — ${hw.parlantes_observacion || 'aprobado'}</li>
          <li>Batería: ${booleanToCheckIcon(hw.bateria_estado)} — ${hw.bateria_observacion || 'aprobado'}</li>
          <li>Carcasa: ${booleanToCheckIcon(hw.carcasa_estado)} — ${hw.carcasa_observacion || 'aprobado'}</li>
          <li>Cargador: ${booleanToCheckIcon(hw.cargador_estado)} — ${hw.cargador_observacion || 'aprobado'}</li>
        </ul>

        <h3>Inspección de Software</h3>
        <ul>
          <li>Sistema Operativo: ${booleanToCheckIcon(sw.sistema_operativo)}</li>
          <li>Antivirus: ${booleanToCheckIcon(sw.antivirus)}</li>
          <li>Office: ${booleanToCheckIcon(sw.office)}</li>
          <li>Navegadores: ${booleanToCheckIcon(sw.navegadores)}</li>
          <li>Compresores: ${booleanToCheckIcon(sw.compresores)}</li>
          <li>Acceso Remoto: ${booleanToCheckIcon(sw.acceso_remoto)}</li>
          <li>Nota: ${sw.nota || 'Ninguna'}</li>
        </ul>

        <h3>Adicionales</h3>
        <ul>
          <li>Mouse: ${booleanToCheckIcon(ad.mouse_estado)} — ${ad.mouse_observacion || 'No aplica'}</li>
          <li>Mochila: ${booleanToCheckIcon(ad.mochila_estado)} — ${ad.mochila_observacion || 'No aplica'}</li>
          <li>Estuche: ${booleanToCheckIcon(ad.estuche_estado)} — ${ad.estuche_observacion || 'No aplica'}</li>
          <li>Software 1: ${booleanToCheckIcon(ad.software1_estado)} — ${ad.software1_observacion || 'No aplica'}</li>
          <li>Software 2: ${booleanToCheckIcon(ad.software2_estado)} — ${ad.software2_observacion || 'No aplica'}</li>
          <li>Software 3: ${booleanToCheckIcon(ad.software3_estado)} — ${ad.software3_observacion || 'No aplica'}</li>
        </ul>
        <button id="descargarActaPDF" style="margin-top: 1rem;">Descargar PDF generado</button>
      `;

            detalleActa.innerHTML = detalle;
            detalleActa.querySelectorAll('ul').forEach(ul => ul.classList.add('dos-columnas'));
        } catch (error) {
            console.error('Error al cargar acta:', error);
            alert('No se pudo cargar el acta');
        }
    }

    // Filtros de búsqueda y fecha
    function aplicarFiltros() {
        const desde = fechaInicio.value;
        const hasta = fechaFin.value;
        const busqueda = buscadorVentas.value.trim().toLowerCase();

        const desdeDate = desde ? new Date(desde + 'T00:00:00') : null;
        const hastaDate = hasta ? new Date(hasta + 'T23:59:59.999') : null;

        const filtradas = actasOriginales.filter((acta) => {
            const fechaUTC = new Date(acta.fecha_registro);
            const fechaActa = new Date(
                fechaUTC.getFullYear(),
                fechaUTC.getMonth(),
                fechaUTC.getDate(),
                fechaUTC.getHours(),
                fechaUTC.getMinutes(),
                fechaUTC.getSeconds(),
                fechaUTC.getMilliseconds()
            );

            if (desdeDate && fechaActa < desdeDate) return false;
            if (hastaDate && fechaActa > hastaDate) return false;

            const cliente = acta.cliente_cedula || '';
            const vendedor = acta.vendedor_nombre?.toLowerCase() || '';
            const producto = `${acta.equipo_marca || ''} ${acta.equipo_modelo || ''} ${acta.equipo_codigo_prd || ''}`.toLowerCase();

            if (!cliente.includes(busqueda) && !vendedor.includes(busqueda) && !producto.includes(busqueda)) {
                return false;
            }

            return true;
        });

        renderizarTablaActas(filtradas);
    }

    // Descargar PDF usando html2pdf
    function descargarPDF() {
        const opciones = {
            margin: 10,
            filename: `acta`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opciones).from(detalleActa).save();
    }

    // Inicializar
    function init() {
        initEventos();
        cargarTablaActas();
    }

    return {
        init
    };
})();

// Arrancamos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ActasModule.init();
});

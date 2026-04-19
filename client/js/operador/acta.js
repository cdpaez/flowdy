// js/operador/acta.js
const ActaModule = (function () {
    // 🔒 Variables y funciones privadas
    let timeout;

    function initEventos() {
        manejarCheckboxes();
        manejarContadores();
        buscarEquipos();
        manejarEnvioFormulario();
    }

    function manejarCheckboxes() {
        // Caso 1: Hardware
        document.querySelectorAll('.input-group-hw').forEach(group => {
            const textInput = group.querySelector('input[type="text"]');
            const checkbox = group.querySelector('input[type="checkbox"]');

            // Inicializar estado
            if (checkbox.checked) {
                textInput.disabled = true;
                textInput.value = '';
            } else {
                textInput.disabled = false;
            }

            // Evento de cambio
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    textInput.disabled = true;
                    textInput.value = '';
                } else {
                    textInput.disabled = false;
                }
            });
        });

        // Caso 2: Adicionales
        document.querySelectorAll('.input-group-ad').forEach(group => {
            const textInput = group.querySelector('input[type="text"]');
            const checkbox = group.querySelector('input[type="checkbox"]');

            // Inicializar estado
            if (!checkbox.checked) {
                textInput.disabled = true;
                textInput.value = '';
            } else {
                textInput.disabled = false;
            }

            // Evento de cambio
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    textInput.disabled = false;
                } else {
                    textInput.disabled = true;
                    textInput.value = '';
                }
            });
        });
    }


    function manejarContadores() {
        // 🎯 Contador para input nota
        const inputNota = document.getElementById('sw_nota');
        const contadorNota = document.getElementById('contador_nota');

        if (inputNota && contadorNota) {
            inputNota.addEventListener('input', () => {
                const longitud = inputNota.value.length;
                contadorNota.textContent = `${longitud} / 100`;

                inputNota.classList.remove('valid', 'warn', 'critical');
                contadorNota.classList.remove('warn', 'critical');

                if (longitud > 61) {
                    inputNota.classList.add('critical');
                    contadorNota.classList.add('critical');
                } else if (longitud > 41) {
                    inputNota.classList.add('warn');
                    contadorNota.classList.add('warn');
                } else if (longitud > 0) {
                    inputNota.classList.add('valid');
                }
            });
        }

        // 📝 Contador para observaciones
        const textareaObs = document.getElementById('observaciones');
        const contadorObs = document.getElementById('contadorobs');

        if (textareaObs && contadorObs) {
            textareaObs.addEventListener('input', () => {
                contadorObs.textContent = `${textareaObs.value.length} / 162`;
            });
        }
    }


    function buscarEquipos() {
        const buscarInput = document.getElementById('buscar-equipo');
        const resultados = document.getElementById('resultados');
        const inputEquipoId = document.getElementById('equipo_id');
        const inputCodigoPrd = document.getElementById('codigo_prd');
        

        if (!buscarInput || !resultados) return;

        buscarInput.addEventListener('input', () => {
            clearTimeout(timeout);

            timeout = setTimeout(async () => {
                const termino = buscarInput.value.trim();
                resultados.innerHTML = '';

                if (termino.length === 0) return;

                try {
                    const res = await fetch(`/equipos/buscar?termino=${termino}`);
                    const data = await res.json();

                    if (data.length === 0) {
                        const li = document.createElement('li');
                        li.textContent = `No se encontró el producto "${termino}"`;
                        li.style.color = 'gray';
                        li.style.pointerEvents = 'none';
                        resultados.appendChild(li);
                        return;
                    }

                    data.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = `${item.marca} - ${item.codigo_prd}`;

                        li.addEventListener('click', () => {
                            document.querySelector('[name="marca"]').value = item.marca;
                            document.querySelector('[name="modelo"]').value = item.modelo;
                            document.querySelector('[name="numero_serie"]').value = item.numero_serie;
                            document.querySelector('[name="procesador"]').value = item.procesador;
                            document.querySelector('[name="tamano"]').value = item.tamano;
                            document.querySelector('[name="disco"]').value = item.disco;
                            document.querySelector('[name="memoria_ram"]').value = item.memoria_ram;
                            document.querySelector('[name="tipo_equipo"]').value = item.tipo_equipo;
                            document.querySelector('[name="estado"]').value = item.estado;
                            document.querySelector('[name="extras"]').value = item.extras;

                            inputEquipoId.value = item.id;
                            inputCodigoPrd.value = item.codigo_prd;

                            resultados.innerHTML = '';
                            buscarInput.value = `${item.marca} - ${item.codigo_prd}`;
                        });

                        resultados.appendChild(li);
                    });

                } catch (error) {
                    console.error('❌ Error al buscar equipos:', error);
                    resultados.innerHTML = '';
                }
            }, 300); // delay para evitar demasiadas peticiones
        });

        // Limpiar resultados si pierde el foco
        buscarInput.addEventListener('blur', () => {
            setTimeout(() => {
                resultados.innerHTML = '';
            }, 200);
        });
    }


    function manejarEnvioFormulario() {
        const form = document.getElementById('actaForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuarioId = parseInt(sessionStorage.getItem('usuarioId'));

            if (!usuarioId || isNaN(usuarioId)) {
                mostrarToast('❌ No se pudo obtener el ID del usuario logueado.', 'error');
                return;
            }

            const datos = {
                cliente: {
                    nombre: form.nombre_cliente.value,
                    cedula_ruc: form.cedula_ruc.value,
                    telefono: form.telefono.value,
                    correo: form.correo.value,
                    direccion: form.direccion.value
                },
                equipo: parseInt(form.equipo_id.value),
                equipo_detalle: {
                    codigo_prd: form.codigo_prd.value,
                    marca: form.marca.value,
                    modelo: form.modelo.value,
                    numero_serie: form.numero_serie.value,
                    procesador: form.procesador.value,
                    tamano: form.tamano.value,
                    disco: form.disco.value,
                    memoria_ram: form.memoria_ram.value,
                    tipo_equipo: form.tipo_equipo.value,
                    estado: form.estado.value,
                    extras: form.extras.value
                },
                inspeccion_hw: obtenerInspeccionHW(form),
                inspeccion_sw: obtenerInspeccionSW(form),
                adicionales: obtenerAdicionales(form),
                acta: {
                    forma_pago: form.forma_pago.value,
                    precio: parseFloat(form.precio.value),
                    usuario_id: usuarioId
                },
                observaciones: form.observaciones.value
            };

            console.log('📦 Datos enviados:', datos);

            try {
                const res = await fetch('/actas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (!res.ok) {
                    const error = await res.json();
                    mostrarToast(error.error || '❌ Error al guardar el acta', 'error');
                    return;
                }

                const resultado = await res.json();
                console.log('✅ Respuesta del servidor:', resultado);

                mostrarToast('✅ Acta registrada con éxito', 'success');

                if (resultado.advertenciaStock) {
                    mostrarToast(resultado.advertenciaStock, 'warning');
                }

                if (resultado.acta_id) {
                    window.open(`/actas/${resultado.acta_id}/pdf`, '_self');
                }

            } catch (error) {
                console.error('❌ Error al enviar:', error);
                mostrarToast('❌ Error al guardar el acta', 'error');
            }
        });
    }


    function mostrarToast(mensaje, tipo = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000); // se elimina después de 3 segundos
    }

    function obtenerInspeccionHW(form) {
        return {
            teclado_estado: form.hw_teclado_check.checked,
            teclado_observacion: form.hw_teclado.value,

            mouse_estado: form.hw_mouse_check.checked,
            mouse_observacion: form.hw_mouse.value,

            camara_estado: form.hw_camara_check.checked,
            camara_observacion: form.hw_camara.value,

            pantalla_estado: form.hw_pantalla_check.checked,
            pantalla_observacion: form.hw_pantalla.value,

            parlantes_estado: form.hw_parlantes_check.checked,
            parlantes_observacion: form.hw_parlantes.value,

            bateria_estado: form.hw_bateria_check.checked,
            bateria_observacion: form.hw_bateria.value,

            carcasa_estado: form.hw_carcasa_check.checked,
            carcasa_observacion: form.hw_carcasa.value,

            cargador_estado: form.hw_cargador_check.checked,
            cargador_observacion: form.hw_cargador.value
        };
    }


    function obtenerInspeccionSW(form) {
        return {
            sistema_operativo: form.sw_sistema_operativo.checked,
            antivirus: form.sw_antivirus.checked,
            office: form.sw_office.checked,
            navegadores: form.sw_navegadores.checked,
            compresores: form.sw_compresores.checked,
            acceso_remoto: form.sw_acceso_remoto.checked,
            nota: form.sw_nota.value
        };
    }


    function obtenerAdicionales(form) {
        return {
            mouse_estado: form.ad_mouse_check.checked,
            mouse_observacion: form.ad_mouse.value,

            mochila_estado: form.ad_mochila_check.checked,
            mochila_observacion: form.ad_mochila.value,

            estuche_estado: form.ad_estuche_check.checked,
            estuche_observacion: form.ad_estuche.value,

            software1_estado: form.ad_software1_check.checked,
            software1_observacion: form.ad_software1.value,

            software2_estado: form.ad_software2_check.checked,
            software2_observacion: form.ad_software2.value,

            software3_estado: form.ad_software3_check.checked,
            software3_observacion: form.ad_software3.value
        };
    }

    // 🌐 API pública
    return {
        init: initEventos
    };
})();

document.addEventListener("DOMContentLoaded", () => {
  ActaModule.init();
});
// js/conexiones/socketConexion.js
const WebSocketModule = (function () {
    let socket = null;

    function init() {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const wsBaseURL = window.location.hostname === 'localhost'
            ? 'ws://localhost:3000'
            : 'wss://copter-2-0-0.onrender.com';

        socket = new WebSocket(`${wsBaseURL}/ws?token=${token}`);

        socket.onopen = manejarApertura;
        socket.onmessage = manejarMensaje;
        socket.onclose = manejarCierre;
        socket.onerror = manejarError;
    }

    function manejarApertura() {
        // Conexión abierta (puedes agregar lógica si quieres)
        console.log('🟢 WebSocket abierto');
    }

    function manejarMensaje(event) {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'connection_established') {
                console.log('✅ Conexión WebSocket establecida');
            }

            if (data.type === 'forced_logout') {
                console.warn('⛔ Usuario deshabilitado por el servidor');
                cerrarSesionConMotivo();
            }
            

        } catch (err) {
            console.error('❌ Error al parsear mensaje WebSocket:', err);
        }
    }

    function manejarCierre(event) {
        console.warn('🔴 WebSocket cerrado:', event.code, event.reason);

        if (event.code === 4003) {
            cerrarSesionConMotivo();
        }
    }

    function manejarError(err) {
        console.error('⚠️ WebSocket error:', err);
    }

    function cerrarSesionConMotivo() {
        sessionStorage.setItem('logout_reason', 'disabled');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('rol');
        sessionStorage.removeItem('usuarioId');

        if (socket) socket.close();

        setTimeout(() => {
            window.location.href = '/index.html';
        }, 100);
    }

    return {
        init
    };
})();

// 🧨 Iniciar conexión cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    WebSocketModule.init();
});

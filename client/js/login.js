// js/auth/login.js
const LoginModule = (function () {
    function init() {
        manejarSubmitLogin();
        mostrarMensajeDesconexion();
    }

    function manejarSubmitLogin() {
        const loginForm = document.getElementById("login-form");
        if (!loginForm) return;

        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const correo = document.getElementById("correo").value;
            const password = document.getElementById("password").value;

            const loginData = { correo, password };

            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData),
                });

                const data = await res.json();

                if (res.ok) {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('rol', data.rol);
                    sessionStorage.setItem('usuarioId', data.id);
                    window.location.href = data.redirect;
                } else {
                    mostrarError(data.mensaje);
                }
            } catch (error) {
                console.error("❌ Error al hacer la petición:", error);
                alert("Hubo un problema al hacer la petición. Intenta de nuevo.");
            }
        });
    }

    function mostrarMensajeDesconexion() {
        const reason = sessionStorage.getItem('logout_reason');
        if (reason !== 'disabled') return;

        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = '⚠️ cuenta desactivada.';
            errorDiv.classList.add('mostrar');

            const form = document.querySelector('.login-form');
            if (form) {
                form.addEventListener('input', () => {
                    errorDiv.classList.remove('mostrar');
                    errorDiv.textContent = '';
                }, { once: true });
            }
        }

        sessionStorage.removeItem('logout_reason');
    }

    function mostrarError(mensaje) {
        const errorDiv = document.getElementById('error-message');
        if (!errorDiv) return;

        errorDiv.textContent = mensaje;
        errorDiv.classList.add('mostrar');

        setTimeout(() => {
            errorDiv.classList.remove('mostrar');
        }, 3000);
    }

    // 🔓 API pública
    return {
        init
    };
})();

// 🚀 Ejecutar al cargar
document.addEventListener("DOMContentLoaded", () => {
    LoginModule.init();
});

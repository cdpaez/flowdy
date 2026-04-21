// js/dashboard/dashboard.js
const DashboardModule = (function () {
    function init() {
        manejarMenuHamburguesa();
        verificarSesion();
        manejarBotonCerrarSesion();
    }

    function manejarMenuHamburguesa() {
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const panelLateral = document.querySelector('.panel-lateral');
        const navButtons = document.querySelectorAll('.pestanas button');

        if (!hamburgerBtn || !panelLateral) return;

        hamburgerBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            panelLateral.classList.toggle('active');
            document.body.style.overflow = panelLateral.classList.contains('active') ? 'hidden' : '';
        });

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    hamburgerBtn.classList.remove('active');
                    panelLateral.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        document.addEventListener('click', function (e) {
            if (
                window.innerWidth <= 768 &&
                panelLateral.classList.contains('active') &&
                !e.target.closest('.panel-lateral') &&
                !e.target.closest('.hamburger-btn')
            ) {
                hamburgerBtn.classList.remove('active');
                panelLateral.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    function verificarSesion() {
        const token = sessionStorage.getItem('token');
        const rol = sessionStorage.getItem('rol');

        if (!token || rol !== 'admin') {
            window.location.href = '../../index.html';
        }
    }

    function manejarBotonCerrarSesion() {
        const btnCerrarSesion = document.getElementById('logout-btn');

        if (!btnCerrarSesion) return;

        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }

    function cerrarSesion() {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Se cerrará tu sesión actual y volverás al inicio.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '¡Hasta pronto!',
                    text: 'Tu sesión ha sido cerrada correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    didClose: () => {
                        sessionStorage.clear();
                        history.replaceState(null, '', 'index.html');
                        window.location.href = '../../index.html';
                    }
                });
            }
        });
    }

    return {
        init
    };
})();

// 🚀 Arrancar
document.addEventListener('DOMContentLoaded', () => {
    DashboardModule.init();
});

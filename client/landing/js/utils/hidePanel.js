let socialPanelLocked = false;

/* =====================================================
   PANEL SOCIAL – OCULTAR EN FOOTER
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

    const panel = document.querySelector(".social-panel");
    const footer = document.querySelector(".footer");

    if (!panel || !footer) return;

    const observer = new IntersectionObserver(entries => {

        if (socialPanelLocked) return; // ← bloqueo

        entries.forEach(entry => {
            panel.classList.toggle("hidden", entry.isIntersecting);
        });

    }, { threshold: 0.1 });

    observer.observe(footer);
});
/* =====================================================
   PANEL SOCIAL – CONTROL MANUAL
===================================================== */
function hideSocialPanel() {

    socialPanelLocked = true;

    document
        .querySelector(".social-panel")
        ?.classList.add("hidden");
}

function showSocialPanel() {

    socialPanelLocked = false;

    document
        .querySelector(".social-panel")
        ?.classList.remove("hidden");
}
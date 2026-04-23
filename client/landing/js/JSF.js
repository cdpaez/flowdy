/* =====================================================
   MENÚ HEADER
===================================================== */
function toggleMenu() {
    const menu = document.getElementById("menu");
    if (!menu) return;

    if (menu.classList.contains("show")) {
        menu.classList.remove("show");
    } else {
        closeAll();
        menu.classList.add("show");
    }
}

/* Cerrar menú al hacer click fuera */
document.addEventListener("click", e => {
    const menu = document.getElementById("menu");
    const menuBtn = document.querySelector(".menu-btn");

    if (!menu || !menuBtn) return;

    if (
        menu.classList.contains("show") &&
        !menu.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        menu.classList.remove("show");
    }
});

/* =====================================================
   ANIMACIONES AL HACER SCROLL
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, observerOptions);

    document.querySelectorAll(
        ".product-card, .category-card, .article-card, .menu-card"
    ).forEach(el => observer.observe(el));
});

/* =====================================================
   PANEL SOCIAL – OCULTAR EN FOOTER
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const panel = document.querySelector(".social-panel");
    const footer = document.querySelector(".footer");
    if (!panel || !footer) return;

    const observer = new IntersectionObserver(entries => {
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
    document.querySelector(".social-panel")?.classList.add("hidden");
}

function showSocialPanel() {
    document.querySelector(".social-panel")?.classList.remove("hidden");
}

/* =====================================================
   CARRITO, LOGIN Y REGISTRO (ABRIR / CERRAR)
===================================================== */

function switchToRegister() {
    document.getElementById("loginView").style.display = "none";
    document.getElementById("registerView").style.display = "block";
}

function switchToLogin() {
    document.getElementById("registerView").style.display = "none";
    document.getElementById("loginView").style.display = "block";
}

function openCart() {
    const cartPanel = document.getElementById("cartPanel");
    if (!cartPanel) return;

    if (cartPanel.classList.contains("active")) {
        closeAll();
        return;
    }

    closeAll();

    document.body.style.overflow = "hidden"; // 🔒 bloquea scroll
    cartPanel.classList.add("active");
    document.getElementById("overlay")?.classList.add("active");
    hideSocialPanel();
}

function openLogin() {
    const login = document.getElementById("loginModal");
    if (!login) return;

    if (login.classList.contains("active")) {
        closeAll();
        return;
    }

    closeAll();
    login.classList.add("active");
    document.getElementById("overlay")?.classList.add("active");
    hideSocialPanel();
}



function closeAll() {
    document.getElementById("cartPanel")?.classList.remove("active");
    document.getElementById("loginModal")?.classList.remove("active");
    document.getElementById("registerModal")?.classList.remove("active");
    document.getElementById("overlay")?.classList.remove("active");
    document.getElementById("menu")?.classList.remove("show");
    document.body.style.overflow = "";

    showSocialPanel();
}

/* =====================================================
   CERRAR AL HACER CLICK FUERA
===================================================== */
document.addEventListener("click", e => {

    const overlay = document.getElementById("overlay");
    if (!overlay) return;

    if (e.target === overlay) {
        closeAll();
    }
});

/* =====================================================
   CARRITO – LÓGICA
===================================================== */
let cart = [];

/* BOTONES AGREGAR */
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".add-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();

            addToCart({
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image
            });
        });
    });

    document.getElementById("shipping")
        ?.addEventListener("change", updateTotals);

    document.querySelector(".primary-btn")
        ?.addEventListener("click", proceedToPay);

    updateCartBadge(); // inicial
});

/* AGREGAR PRODUCTO */
function addToCart(product) {
    const item = cart.find(p => p.id === product.id);

    if (item) {
        item.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    openCart();
    renderCart();
}

/* RENDER CARRITO */
function renderCart() {
    const container = document.getElementById("cartItems");
    const summary = document.querySelector(".cart-summary");

    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Tu carrito está vacío</p>";
        if (summary) summary.style.display = "none";
        updateTotals();
        updateCartBadge();
        return;
    }

    if (summary) summary.style.display = "block";

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-info">
                <strong>${item.name}</strong>
                <p>$${item.price.toFixed(2)}</p>

                <div class="cart-controls">
                    <button class="qty-btn">−</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn">+</button>
                </div>

                <div class="remove">Eliminar</div>
            </div>
        `;

        div.querySelector(".remove").onclick = () => removeItem(item.id);
        div.querySelectorAll(".qty-btn")[0].onclick = () => changeQty(item.id, -1);
        div.querySelectorAll(".qty-btn")[1].onclick = () => changeQty(item.id, 1);

        container.appendChild(div);
    });

    updateTotals();
    updateCartBadge();
}

/* CONTADOR CARRITO (BADGE) */
function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    if (totalItems === 0) {
        badge.style.display = "none";
    } else {
        badge.style.display = "flex";
        badge.textContent = totalItems;
    }
}

/* CAMBIAR CANTIDAD */
function changeQty(id, amount) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.qty += amount;

    if (item.qty <= 0) {
        removeItem(id);
    } else {
        renderCart();
    }
}

/* ELIMINAR PRODUCTO */
function removeItem(id) {
    cart = cart.filter(p => p.id !== id);
    renderCart();
}

/* TOTALES */
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
    const shippingEl = document.getElementById("shipping");

    if (!subtotalEl || !totalEl || !shippingEl) return;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    const shipping = Number(shippingEl.value);
    totalEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

/* =====================================================
   SIMULACIÓN PAGO
===================================================== */
function proceedToPay() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    // Total
    const total = document.getElementById("total").textContent;

    // Resumen de productos (legible)
    const productsSummary = cart.map(item =>
        `${item.name} x${item.qty} ($${item.price})`
    ).join(", ");

    // Cargar datos al formulario
    document.getElementById("cartTotalInput").value = total;
    document.getElementById("cartProductsInput").value = productsSummary;

    // Enviar POST a Formspree
    document.getElementById("cartForm").submit();
}


/* =====================================================
   Formulario de registro – ENVÍO REAL + REDIRECCIÓN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registrationForm");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    "Accept": "application/json"
                }
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = "flowdy2.html";
                } else {
                    alert("Error al enviar el formulario. Intenta nuevamente.");
                }
            })
            .catch(() => {
                alert("Error de conexión.");
            });
        });
    }

    document.getElementById("closeModal")?.addEventListener("click", () => {
        window.location.href = "flowdy2.html";
    });

    document.getElementById("cancelBtn")?.addEventListener("click", () => {
        window.location.href = "flowdy2.html";
    });

});


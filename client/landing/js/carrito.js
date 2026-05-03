const CartModule = (() => {

    /* ==============================
       1. ESTADO DEL MODULO
       ============================== */
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


    /* ==============================
       2. SELECTORES DEL DOM
       ============================== */
    const DOM = {
        cartItems: () => document.getElementById("cartItems"),
        subtotal: () => document.getElementById("subtotal"),
        total: () => document.getElementById("total"),
        shipping: () => document.getElementById("shipping"),
        cartCount: () => document.getElementById("cartCount"),
        cartPanel: () => document.getElementById("cartPanel"),
        overlay: () => document.getElementById("overlay"),
        socialPanel: () => document.querySelector(".social-panel"),
        checkoutForm: () => document.getElementById("checkoutForm"),
        checkoutModal: () => document.getElementById("checkoutModal"),
        checkoutBtn: () => document.getElementById("checkoutBtn")
    };


    /* ==============================
       3. FUNCIONES DE DATOS (STORAGE)
       ============================== */
    const guardarCarrito = () => {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    };

    const obtenerCarrito = () => carrito;


    /* ==============================
       4. FUNCIONES DE RENDERIZADO
       ============================== */
    const actualizarContador = () => {

        const cartCount = DOM.cartCount();
        if (!cartCount) return;

        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

        cartCount.textContent = totalItems;

        if (totalItems > 0) {
            cartCount.style.display = "flex";
        } else {
            cartCount.style.display = "none";
        }
    };


    const calcularTotal = () => {

        const subtotalEl = DOM.subtotal();
        const totalEl = DOM.total();
        const shippingSelect = DOM.shipping();
        // TODO: Si no hay opción de envío, asumir costo 0
        if (!subtotalEl || !totalEl) return;

        const subtotal = carrito.reduce((acc, item) => {
            return acc + (item.price * item.cantidad);
        }, 0);

        // const envio = parseFloat(shippingSelect.value);
        const envio = 0; // Asumir costo 0 si no hay opción de envío

        const total = subtotal + envio;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    };


    const renderCarrito = () => {

        const cartItems = DOM.cartItems();

        if (!cartItems) return;

        if (carrito.length === 0) {

            cartItems.innerHTML = `<p>Tu carrito está vacío</p>`;

            DOM.subtotal().textContent = "$0.00";
            DOM.total().textContent = "$0.00";

            actualizarContador();

            return;
        }

        cartItems.innerHTML = "";

        carrito.forEach(item => {

            const div = document.createElement("div");
            div.classList.add("cart-item");

            div.innerHTML = `
                <img src="${item.image}" width="50">

                <div class="cart-info">
                    <strong>${item.name}</strong>
                    <p>$${item.price.toFixed(2)}</p>

                    <div class="cart-controls">

                        <button class="minus" data-id="${item.id}">−</button>

                        <span>${item.cantidad}</span>

                        <button class="plus" data-id="${item.id}">+</button>

                        <button class="remove" data-id="${item.id}">
                        🗑
                        </button>

                    </div>

                </div>
            `;

            cartItems.appendChild(div);
        });

        calcularTotal();
        actualizarContador();
    };


    /* ==============================
       5. FUNCIONES DE CONTROL
       ============================== */

    function mostrarToast(mensaje) {

        const toast = document.getElementById("toast");
        if (!toast) return;

        toast.textContent = mensaje;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    const abrirCheckout = () => {

        // validar carrito
        if (carrito.length === 0) {
            mostrarToast("Debe agregar al menos un producto al carrito");
            return;
        }

        const modal = DOM.checkoutModal();
        if (!modal) return;

        modal.classList.add("active");
    };

    const cerrarCheckout = () => {

        const modal = DOM.checkoutModal();
        if (!modal) return;

        modal.classList.remove("active");
    };

    const hideSocialPanel = () => {

        const socialPanel = DOM.socialPanel();

        if (!socialPanel) return;

        socialPanel.classList.add("hidden");
    };

    const showSocialPanel = () => {

        const socialPanel = DOM.socialPanel();

        if (!socialPanel) return;

        socialPanel.classList.remove("hidden");
    };

    const closeAll = () => {

        const cartPanel = DOM.cartPanel();
        const overlay = DOM.overlay();

        cartPanel?.classList.remove("active");
        overlay?.classList.remove("active");

        document.body.style.overflow = "";
        showSocialPanel();
    };

    const openCart = () => {

        const cartPanel = DOM.cartPanel();
        const overlay = DOM.overlay();

        if (!cartPanel) return;

        if (cartPanel.classList.contains("active")) {
            closeAll();
            return;
        }

        closeAll();

        document.body.style.overflow = "hidden";
        cartPanel.classList.add("active");
        overlay?.classList.add("active");

        hideSocialPanel();
    };


    const agregarProducto = (producto) => {

        const existente = carrito.find(p => p.id == producto.id);

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                ...producto,
                cantidad: 1
            });
        }

        guardarCarrito();
        renderCarrito();
        actualizarContador();
    };


    const aumentarCantidad = (id) => {

        const producto = carrito.find(p => p.id == id);

        if (producto) {
            producto.cantidad++;
        }

        guardarCarrito();
        renderCarrito();
    };


    const disminuirCantidad = (id) => {

        const producto = carrito.find(p => p.id == id);

        if (!producto) return;

        producto.cantidad--;

        if (producto.cantidad <= 0) {
            carrito = carrito.filter(p => p.id != id);
        }

        guardarCarrito();
        renderCarrito();
    };


    const eliminarProducto = (id) => {

        carrito = carrito.filter(p => p.id != id);

        guardarCarrito();
        renderCarrito();
    };


    const initEventos = () => {

        const shippingSelect = DOM.shipping();

        if (shippingSelect) {
            shippingSelect.addEventListener("change", calcularTotal);
        }

        document.addEventListener("click", (e) => {

            if (e.target.classList.contains("add-btn")) {

                const producto = {
                    id: e.target.dataset.id,
                    name: e.target.dataset.name,
                    price: parseFloat(e.target.dataset.price),
                    image: e.target.dataset.image
                };

                agregarProducto(producto);
            }

            if (e.target.classList.contains("plus")) {
                aumentarCantidad(e.target.dataset.id);
            }

            if (e.target.classList.contains("minus")) {
                disminuirCantidad(e.target.dataset.id);
            }

            if (e.target.classList.contains("remove")) {
                eliminarProducto(e.target.dataset.id);
            }

        });

        const checkoutBtn = DOM.checkoutBtn();

        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", abrirCheckout);
        }

        const checkoutForm = DOM.checkoutForm();

        if (!checkoutForm) return;

        checkoutForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const formData = new FormData(checkoutForm);

            const cliente = {
                nombre: formData.get("nombre"),
                apellido: formData.get("apellido"),
                telefono: formData.get("telefono"),
                email: formData.get("email"),
                direccion: formData.get("direccion"),
                cedula_ruc: formData.get("cedula_ruc")
            };

            const pedido = {
                direccion_entrega: formData.get("direccion_entrega")
            };

            const detalles = carrito.map(item => ({
                producto_id: parseInt(item.id),
                cantidad: item.cantidad
            }));

            const payload = {
                cliente,
                pedido,
                detalles
            };

            try {

                const res = await fetch("/api/pedidos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Error al enviar pedido");
                }

                /* ===============================
                   PEDIDO EXITOSO
                =============================== */

                // limpiar carrito en memoria
                carrito = [];

                // limpiar almacenamiento
                localStorage.removeItem("carrito");

                // actualizar interfaz
                renderCarrito();
                actualizarContador();

                // limpiar formulario
                checkoutForm.reset();

                // cerrar modal checkout
                cerrarCheckout();

                console.log("Pedido registrado correctamente", data);

            } catch (error) {

                console.error("Error enviando pedido:", error);

            }

        });

    };


    /* ==============================
       6. INICIALIZACION
       ============================== */
    const init = () => {

        renderCarrito();
        initEventos();
    };


    return {
        init,
        openCart,
        closeAll,
        agregarProducto,
        obtenerCarrito,
        cerrarCheckout
    };

})();

document.addEventListener("DOMContentLoaded", CartModule.init);
const GestorProductos = (() => {

    /* ==============================
       1. ESTADO DEL MODULO
       ============================== */



    /* ==============================
       2. SELECTORES DEL DOM
       ============================== */
    const DOM = {
        gridPopular: () => document.getElementById("productGridPopular"),
        gridNuevos: () => document.getElementById("productGridNuevos"),
        gridMenu: () => document.getElementById("productGridMenu"),
        openCartBtn: () => document.getElementById("openCartBtn")
    };


    /* ==============================
       3. FUNCIONES DE DATOS (API)
       ============================== */
    const obtenerProductos = async (url) => {
        const res = await fetch(url);
        return await res.json();
    };


    /* ==============================
       4. FUNCIONES DE RENDERIZADO
       ============================== */
    const renderProductos = (productos, contenedor) => {

        if (!contenedor) return;

        contenedor.innerHTML = "";

        productos.forEach(producto => {

            const card = document.createElement("div");
            card.classList.add("product-card");

            card.innerHTML = `
                <div class="product-image">
                    <img src="${producto.imagen}" alt="${producto.nombre}">

                    ${producto.es_popular
                    ? '<div class="product-badge badge-popular">Más vendido</div>'
                    : ''}

                    ${producto.es_nuevo
                    ? '<div class="product-badge badge-nuevo">Nuevo</div>'
                    : ''}

                    ${producto.activo
                    ? '<div class="product-badge badge-fit">FIT</div>'
                    : ''}
                </div>

                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>

                    <div class="price-add">
                        <span class="price">$${producto.precio}</span>

                        <button class="add-btn"
                            data-id="${producto.id}"
                            data-name="${producto.nombre}"
                            data-price="${producto.precio}"
                            data-image="${producto.imagen}">
                            Agregar
                        </button>
                    </div>

                    <div class="delivery-info">Envío gratis Calderón</div>
                </div>
            `;

            card.classList.add("visible");
            contenedor.appendChild(card);

        });
    };


    /* ==============================
       5. FUNCIONES DE CONTROL
       ============================== */
    const cargarPopulares = async () => {

        const contenedor = DOM.gridPopular();
        const productos = await obtenerProductos("/api/productos?popular=true");

        renderProductos(productos, contenedor);
    };


    const cargarNuevos = async () => {

        const contenedor = DOM.gridNuevos();
        const productos = await obtenerProductos("/api/productos?nuevo=true");

        renderProductos(productos, contenedor);
    };


    const cargarMenu = async () => {

        const contenedor = DOM.gridMenu();
        const productos = await obtenerProductos("/api/productos");

        renderProductos(productos, contenedor);
    };


    const initEventos = () => {

        const openCartBtn = DOM.openCartBtn();

        if (openCartBtn) {
            openCartBtn.addEventListener("click", CartModule.openCart);
        }

        // Bounce en botones Agregar
        document.addEventListener("click", (e) => {

            const btn = e.target.closest(".add-btn");
            if (!btn) return;

            btn.classList.remove("bounce");
            void btn.offsetWidth;
            btn.classList.add("bounce");

        });
    };


    /* ==============================
       6. INICIALIZACION
       ============================== */
    const init = () => {

        cargarPopulares();
        cargarNuevos();
        cargarMenu();
        initEventos();
    };

    return { init };

})();

document.addEventListener('DOMContentLoaded', GestorProductos.init);
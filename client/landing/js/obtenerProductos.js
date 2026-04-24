document.addEventListener("DOMContentLoaded", async () => {

    const contenedor = document.getElementById("productGrid");

    try {

        const respuesta = await fetch("/api/productos");
        const productos = await respuesta.json();

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

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
    
});
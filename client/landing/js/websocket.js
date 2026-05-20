const wsBaseURL =
    window.location.hostname === 'localhost'
        ? 'ws://localhost:5001'
        : 'wss://www.flowdy.fit';

const socket = new WebSocket(`${wsBaseURL}/ws`);

socket.onmessage = (event) => {

    const data = JSON.parse(event.data);

    switch (data.type) {

        case 'producto_creado':
        case 'producto_actualizado':
        case 'producto_eliminado':
        case 'producto_estado':

            GestorProductos.recargarProductos();
            break;
    }
};
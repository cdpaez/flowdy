const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreoPedido(destinatario, pedido) {

  const filasProductos = pedido.detalles.map(d => `
    <tr>
      <td>${d.nombre_producto}</td>
      <td>${d.categoria_nombre}</td>
      <td align="center">${d.cantidad}</td>
      <td align="right">$${Number(d.precio_unitario).toFixed(2)}</td>
      <td align="right">$${Number(d.subtotal).toFixed(2)}</td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"Flowdy" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: `Confirmación de pedido #${pedido.id}`,
    html: `
      <h2>Confirmación de pedido</h2>

      <p>Estimado ${pedido.snapshot_nombre} ${pedido.snapshot_apellido},</p>
      <p>Hemos recibido su pedido correctamente.</p>

      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width:100%;">
        <thead>
          <tr>
            <th align="left">Producto</th>
            <th align="left">Categoría</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>

        <tbody>
          ${filasProductos}
        </tbody>

        <tfoot>
          <tr>
            <td colspan="4" align="right"><strong>Total</strong></td>
            <td align="right"><strong>$${Number(pedido.total).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p><strong>Dirección de entrega:</strong> ${pedido.direccion_entrega}</p>

      <p>Gracias por su compra.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  enviarCorreoPedido
};
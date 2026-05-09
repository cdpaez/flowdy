const validator = require("validator");

function validateEmail(req, res, next) {
  const email = req.body?.cliente?.email;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      error: "Formato de email inválido"
    });
  }

  req.body.cliente.email = validator.normalizeEmail(email);
  next();
}

module.exports = validateEmail;
// middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  // 1) Busca primero en la cabecera
  let auth = req.headers.authorization;
  let token;

  if (auth && auth.startsWith('Bearer ')) {
    token = auth.split(' ')[1];
  } else if (req.query && req.query.token) {
    // 2) Si no vino en header, prueba en ?token=
    token = req.query.token;
  }

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload;
    next();
  });
}

module.exports = authenticateJWT;

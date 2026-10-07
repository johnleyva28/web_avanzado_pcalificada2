const jwt = require('jsonwebtoken');

const JWT_VERIFY_OPTIONS = {
  algorithms: ['HS256'],
  issuer: 'farmacia-api',
  audience: 'farmacia-web',
};

const COOKIE_NAME = 'farmacia_token';

const verificarToken = (req, res, next) => {
  // 1) Header Authorization: Bearer <token> (compatibilidad con clientes que
  //    usan sessionStorage y Bearer, o tools como curl/Postman).
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  }

  // 2) Cookie httpOnly `farmacia_token` (recomendado para el frontend web).
  if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, JWT_VERIFY_OPTIONS);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = { verificarToken };

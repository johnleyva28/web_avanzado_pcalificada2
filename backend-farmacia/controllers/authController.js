const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_OPTIONS = {
  algorithm: 'HS256',
  issuer: 'farmacia-api',
  audience: 'farmacia-web',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
};

const COOKIE_NAME = 'farmacia_token';
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, // Secure solo en HTTPS; en dev localhost no aplica
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8h, igual que el JWT
  path: '/',
};

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existeUsuario = await User.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Política: el registro público solo crea cuentas 'cliente'. Cualquier
    // promoción a admin/moderador debe hacerse desde un endpoint interno
    const nuevoUsuario = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'cliente',
    });

    const token = jwt.sign(
      { id: nuevoUsuario.id, rol: nuevoUsuario.rol, email: nuevoUsuario.email },
      process.env.JWT_SECRET,
      JWT_OPTIONS
    );

    setAuthCookie(res, token);
    res.status(201).json({
      message: 'Usuario registrado con éxito',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ where: { email } });
    // Comparar siempre contra un hash dummy para igualar el tiempo de
    const hashDummy = '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012';
    await bcrypt.compare(password || '', usuario ? usuario.password : hashDummy);

    if (!usuario || !passwordValido(usuario, password)) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, email: usuario.email },
      process.env.JWT_SECRET,
      JWT_OPTIONS
    );

    setAuthCookie(res, token);
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Sesión cerrada.' });
};

function passwordValido(usuario, password) {
  // Se valida fuera del flujo de control principal para que el helper
  // de timing se ejecute siempre, incluso cuando el usuario no existe.
  return usuario ? bcrypt.compareSync(password, usuario.password) : false;
}

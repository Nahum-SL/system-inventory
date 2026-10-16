
const db = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helpers
const response = require("../helpers/response");

// Controlador de autenticación
exports.login = async (req, res, next) => {
  try {
    // Extraemos el nombre de usuario y la contraseña del cuerpo de la solicitud
    const { username, password } = req.body || {};

    // Validación básica de entrada
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return response.error(
        res,
        "Debes ingresar usuario y contraseña",
        400
      );
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("JWT_SECRET no está configurado"));
    }

    // Buscar usuario y datos de su persona asociada
    const usuario = await db("usuarios as u")
      .join("personas as p", "u.persona_id", "p.id")
      .select(
        "u.id",
        "u.persona_id",
        "u.username",
        "u.password",
        "u.rol",
        "p.nombres",
        "p.apellidos"
      )
      .where("u.username", username.trim())
      .first();

    // Mensaje genérico para no revelar si existe el usuario
    if (!usuario) {
      return response.error(
        res,
        "Usuario o contraseña incorrectos",
        401
      );
    }

    // Comparar contraseña con el hash almacenado
    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    // Si la contraseña no es válida, respondemos con un mensaje genérico
    if (!passwordValida) {
      return response.error(
        res,
        "Usuario o contraseña incorrectos",
        401
      );
    }

    // Crear token de sesión
    const token = jwt.sign(
      {
        id: usuario.id,
        persona_id: usuario.persona_id,
        username: usuario.username,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "2h",
      }
    );

    // Responder con el token y la información del usuario
    return response.success(res, "Inicio de sesión correcto", {
      token,
      tipo: "Bearer",
      expiresIn: 7200,
      usuario: {
        id: usuario.id,
        persona_id: usuario.persona_id,
        username: usuario.username,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    // Manejo de errores
    next(error);
  }
};

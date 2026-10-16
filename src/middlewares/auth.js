const jwt = require("jsonwebtoken");

// Middleware de autenticación
// req: objeto de solicitud (request) de Express
// res: objeto de respuesta (response) de Express
// next: función que se llama para pasar al siguiente middleware o ruta

exports.auth = (req, res, next) => {
  // Obtenemos el encabezado de autorización
  const authorization = req.headers.authorization;

  // Verificamos si el encabezado de autorización está presente y tiene el formato correcto
  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    return res.status(401).json({
      error: "Acceso no autorizado",
    });
  }

  // Verificamos si la variable de entorno JWT_SECRET está configurada
  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET no está configurado"));
  }

  // Extraemos el token del encabezado de autorización
  const token = authorization.replace(/^Bearer\s+/i, "");

  try {
    // El payload pasa a leerse
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Validamos que el payload tenga la estructura esperada
    if (
      !payload ||
      typeof payload !== "object" ||
      !payload.id ||
      typeof payload.id !== "number" ||
      !["admin", "usuario"].includes(payload.rol)
    ) {
      // Si el payload no es válido, respondemos con un error de sesión no válida
      return res.status(401).json({
        error: "Sesión no válida",
      });
    }
    req.user = payload;
    next();
  } catch (e) {
    
    // Manejo de errores específicos de JWT
    if (
      e.name === "TokenExpiredError" ||
      e.name === "JsonWebTokenError" ||
      e.name === "NotBeforeError"
    ) {
      return res.status(401).json({ error: "Sesión expirada" });
    }

    next(e);
  }
};
exports.admin = (req, res, next) =>
  req.user.rol === "admin"
    ? next()
    : res.status(403).json({ error: "Requiere administrador" });


const express = require("express");
const router = express.Router();

// Controlador de autenticación
const authController = require("../controllers/auth.controller");

// Ruta para el inicio de sesión
router.post("/login", authController.login);

module.exports = router;

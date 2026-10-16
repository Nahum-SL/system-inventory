const express = require("express");
const router = express.Router();

const activosController = require("../controllers/activos.controller");
const { auth, admin } = require("../middlewares/auth");

// ==============
// Consultas
// ==============
router.get("/", auth, activosController.listarActivos);
router.get("/codigo/:codigo", auth, activosController.obtenerPorCodigo);
router.get("/:id", auth, activosController.obtenerActivo);

// ================================
// Escrituras: solo administrador
// ================================
router.post("/", auth, admin, activosController.crearActivo);
router.put("/:id", auth, admin, activosController.actualizarActivo);
router.patch("/:id/estado", auth, admin, activosController.cambiarEstado);

module.exports = router;
const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware ya que la comunicacion se hace por JSON
app.use(express.json());

const activosRouter = require("./src/routers/activos.routers");

// CORS
const cors = require("cors");

app.use("/api/activos", activosRouter);

app.use(cors());

// Ruta general de toda la app
// http://localhost:3000
app.get("/", (req, res) => {
  res.send("API de Logistica funcionando correctamente");
});

app.listen(PORT, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});

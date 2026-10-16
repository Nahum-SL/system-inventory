const db = require("../config/db");
const response = require("../helpers/response");

const ESTADOS_VALIDOS = ["activo", "inactivo", "mantenimiento"];

const CAMPOS_ACTIVO = [
  "marca_id",
  "categoria_id",
  "area_id",
  "codigo_inventario",
  "fechaingreso",
  "descripcion",
  "estado",
];

const CAMPOS_ACTUALIZABLES = [
  "marca_id",
  "categoria_id",
  "area_id",
  "codigo_inventario",
  "fechaingreso",
  "descripcion",
  "estado",
];

// Convierte los IDs a enteros positivos.
const esIdValido = (valor) =>
  Number.isInteger(Number(valor)) && Number(valor) > 0;

// Valida los campos que se envían.
const validarActivo = (datos, parcial = false) => {
  const errores = [];

  // Validación de campos obligatorios y tipos de datos
  for (const campo of CAMPOS_ACTIVO) {
    if (!parcial && datos[campo] === undefined) {
      errores.push(`El campo ${campo} es obligatorio`);
    }
  }

  // Validación de IDs
  for (const campo of ["marca_id", "categoria_id", "area_id"]) {
    if (datos[campo] !== undefined && !esIdValido(datos[campo])) {
      errores.push(`${campo} debe ser un entero positivo`);
    }
  }

  // Validación de campos de texto y fecha
  for (const campo of [
    "codigo_inventario",
    "fechaingreso",
    "descripcion",
    "estado",
  ]) {
    if (
      datos[campo] !== undefined &&
      (typeof datos[campo] !== "string" || datos[campo].trim() === "")
    ) {
      errores.push(`${campo} no puede estar vacío`);
    }
  }

  // Validación de longitud de campos de texto
  if (
    datos.codigo_inventario !== undefined &&
    typeof datos.codigo_inventario === "string" &&
    datos.codigo_inventario.trim().length > 150
  ) {
    errores.push("codigo_inventario no puede superar 150 caracteres");
  }

  // Validación de fecha
  if (
    datos.descripcion !== undefined &&
    typeof datos.descripcion === "string" &&
    datos.descripcion.trim().length > 250
  ) {
    errores.push("descripcion no puede superar 250 caracteres");
  }

  // Validación de fecha en formato YYYY-MM-DD
  if (
    datos.fechaingreso !== undefined &&
    (typeof datos.fechaingreso !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaingreso) ||
      !fechaValida(datos.fechaingreso))
  ) {
    errores.push("fechaingreso debe ser una fecha válida YYYY-MM-DD");
  }

  // Validación de estado
  if (datos.estado !== undefined && !ESTADOS_VALIDOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`);
  }

  // Retorna un array con los errores encontrados, si no hay errores retorna un array vacío.
  return errores;
};

// Valida si la fecha es válida considerando años bisiestos y meses con diferente cantidad de días.
const fechaValida = (valor) => {
  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
};

// Columnas comunes para mostrar los datos relacionados.
const consultaActivos = () =>
  db("activos as a")
    .join("marcas as m", "a.marca_id", "m.id")
    .join("categorias as c", "a.categoria_id", "c.id")
    .join("areas as ar", "a.area_id", "ar.id")
    .select(
      "a.id",
      "a.marca_id",
      "m.nombre as marca",
      "a.categoria_id",
      "c.nombre as categoria",
      "a.area_id",
      "ar.nombre as area",
      "a.codigo_inventario",
      "a.fechaingreso",
      "a.descripcion",
      "a.estado",
      "a.fecharegistro",
    );

// GET /api/activos
exports.listarActivos = async (req, res, next) => {
  try {
    const pagina = Math.max(1, Number.parseInt(req.query.pagina, 10) || 1);
    const limite = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limite, 10) || 10),
    );
    const busqueda =
      typeof req.query.buscar === "string" ? req.query.buscar.trim() : "";

    const query = consultaActivos();

    if (busqueda) {
      query.where((builder) => {
        builder
          .where("a.codigo_inventario", "like", `%${busqueda}%`)
          .orWhere("a.descripcion", "like", `%${busqueda}%`)
          .orWhere("m.nombre", "like", `%${busqueda}%`)
          .orWhere("c.nombre", "like", `%${busqueda}%`)
          .orWhere("ar.nombre", "like", `%${busqueda}%`);
      });
    }

    if (req.query.estado !== undefined) {
      if (!ESTADOS_VALIDOS.includes(req.query.estado)) {
        return response.error(res, "Estado de búsqueda no válido", 400);
      }

      query.where("a.estado", req.query.estado);
    }

    if (req.query.area_id !== undefined) {
      if (!esIdValido(req.query.area_id)) {
        return response.error(res, "area_id no es válido", 400);
      }

      query.where("a.area_id", Number(req.query.area_id));
    }

    const totalQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count({
        total: "a.id",
      })
      .first();

    const [totalResult, activos] = await Promise.all([
      totalQuery,
      query
        .orderBy("a.id", "desc")
        .limit(limite)
        .offset((pagina - 1) * limite),
    ]);

    const total = Number(totalResult.total);

    return response.success(res, "Activos obtenidos correctamente", {
      activos,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/activos/:id
exports.obtenerActivo = async (req, res, next) => {
  try {
    if (!esIdValido(req.params.id)) {
      return response.error(res, "ID de activo no válido", 400);
    }

    const activo = await consultaActivos()
      .where("a.id", Number(req.params.id))
      .first();

    if (!activo) {
      return response.error(res, "Activo no encontrado", 404);
    }

    return response.success(res, "Activo obtenido correctamente", activo);
  } catch (error) {
    next(error);
  }
};

// GET /api/activos/codigo/:codigo
exports.obtenerPorCodigo = async (req, res, next) => {
  try {
    const codigo = req.params.codigo.trim();

    if (!codigo || codigo.length > 150) {
      return response.error(res, "Código de inventario no válido", 400);
    }

    const activo = await consultaActivos()
      .where("a.codigo_inventario", codigo)
      .first();

    if (!activo) {
      return response.error(res, "Activo no encontrado", 404);
    }

    return response.success(res, "Activo obtenido correctamente", activo);
  } catch (error) {
    next(error);
  }
};

// POST /api/activos
exports.crearActivo = async (req, res, next) => {
  try {
    const errores = validarActivo(req.body);

    if (errores.length > 0) {
      return response.error(res, errores.join("; "), 400);
    }

    // Solo aceptamos campos definidos por el esquema.
    const datos = {};

    for (const campo of CAMPOS_ACTIVO) {
      const valor = req.body[campo];

      datos[campo] = typeof valor === "string" ? valor.trim() : valor;
    }

    const [id] = await db("activos").insert(datos);

    const activo = await consultaActivos().where("a.id", id).first();

    return response.success(
      res,
      "Activo registrado correctamente",
      activo,
      201,
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.error(
        res,
        "El código de inventario ya está registrado",
        409,
      );
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.error(
        res,
        "La marca, categoría o área seleccionada no existe",
        400,
      );
    }

    next(error);
  }
};

// PUT /api/activos/:id
// Actualiza los campos enviados, no exige enviar todos.
exports.actualizarActivo = async (req, res, next) => {
  try {
    if (!esIdValido(req.params.id)) {
      return response.error(res, "ID de activo no válido", 400);
    }

    const id = Number(req.params.id);

    const camposEnviados = Object.keys(req.body);
    const camposDesconocidos = camposEnviados.filter(
      (campo) => !CAMPOS_ACTUALIZABLES.includes(campo),
    );

    if (camposDesconocidos.length > 0) {
      return response.error(
        res,
        `Campos no permitidos: ${camposDesconocidos.join(", ")}`,
        400,
      );
    }

    if (camposEnviados.length === 0) {
      return response.error(res, "No se enviaron datos para actualizar", 400);
    }

    const errores = validarActivo(req.body, true);

    if (errores.length > 0) {
      return response.error(res, errores.join("; "), 400);
    }

    const existente = await db("activos").where({ id }).first();

    if (!existente) {
      return response.error(res, "Activo no encontrado", 404);
    }

    const datos = {};

    for (const campo of CAMPOS_ACTUALIZABLES) {
      if (req.body[campo] !== undefined) {
        datos[campo] =
          typeof req.body[campo] === "string"
            ? req.body[campo].trim()
            : req.body[campo];
      }
    }

    await db("activos").where({ id }).update(datos);

    const actualizado = await consultaActivos().where("a.id", id).first();

    return response.success(
      res,
      "Activo actualizado correctamente",
      actualizado,
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.error(
        res,
        "El código de inventario ya está registrado",
        409,
      );
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.error(
        res,
        "La marca, categoría o área seleccionada no existe",
        400,
      );
    }

    next(error);
  }
};

// PATCH /api/activos/:id/estado
exports.cambiarEstado = async (req, res, next) => {
  try {
    if (!esIdValido(req.params.id)) {
      return response.error(res, "ID de activo no válido", 400);
    }

    const { estado } = req.body;

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return response.error(
        res,
        `estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`,
        400,
      );
    }

    const id = Number(req.params.id);
    const activo = await db("activos").where({ id }).first();

    if (!activo) {
      return response.error(res, "Activo no encontrado", 404);
    }

    await db("activos").where({ id }).update({ estado });

    const actualizado = await consultaActivos().where("a.id", id).first();

    return response.success(
      res,
      "Estado actualizado correctamente",
      actualizado,
    );
  } catch (error) {
    next(error);
  }
};

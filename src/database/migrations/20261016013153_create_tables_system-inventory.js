/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // ======================
  // TABLAS INDEPENDIENTES
  // ======================
  await knex.schema.createTable("personas", function (table) {
    table.increments("id").primary();
    table.string("apellidos", 150).notNullable();
    table.string("nombres", 150).notNullable();
    table.string("tipodoc", 50).notNullable();
    table.string("numerodoc", 8).notNullable().unique();
    table.string("telefono", 9).notNullable();
    table.string("email", 150).notNullable().unique();
    table.timestamp("fecharegistro").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("areas", function (table) {
    table.increments("id").primary();
    table.string("nombre", 150).notNullable().unique();
    table.timestamp("fecharegistro").defaultTo(knex.fn.now()); // Guardamos la fecha
  });

  await knex.schema.createTable("marcas", function (table) {
    table.increments("id").primary();
    table.string("nombre", 150).notNullable().unique();
    table.timestamp("fecharegistro").defaultTo(knex.fn.now()); // Guardamos la fecha
  });

  await knex.schema.createTable("categorias", function (table) {
    table.increments("id").primary();
    table.string("nombre", 150).notNullable().unique();
    table.timestamp("fecharegistro").defaultTo(knex.fn.now()); // Guardamos la fecha
  });

  // ======================
  // TABLAS DEPENDIENTES
  // ======================
  await knex.schema.createTable("cargos", function (table) {
    table.increments("id").primary();
    table.integer("area_id").unsigned().notNullable();
    table.string("nombre", 150).notNullable();

    table.foreign("area_id").references("id").inTable("areas");
    table.unique(["area_id", "nombre"]); // Combinación única de area_id y nombre
  });

  await knex.schema.createTable("usuarios", function (table) {
    table.increments("id").primary();
    table.integer("persona_id").unsigned().notNullable();
    table.string("username", 150).notNullable().unique();
    table.string("password", 150).notNullable();
    table.enu("rol", ["admin", "usuario"]).notNullable();

    table.foreign("persona_id").references("id").inTable("personas");

  });

  await knex.schema.createTable("activos", function (table) {
    table.increments("id").primary();
    table.integer("marca_id").unsigned().notNullable();
    table.integer("categoria_id").unsigned().notNullable();
    table.integer("area_id").unsigned().notNullable();

    table.string("codigo_inventario", 150).notNullable().unique();
    table.date("fechaingreso").notNullable();
    table.string("descripcion", 250).notNullable();
    table.enu("estado", ["activo", "inactivo", "mantenimiento"]).notNullable();
    table.timestamp("fecharegistro").defaultTo(knex.fn.now()); // Guardamos la fecha

    table.foreign("marca_id").references("id").inTable("marcas");
    table.foreign("categoria_id").references("id").inTable("categorias");
    table.foreign("area_id").references("id").inTable("areas");

  });

  await knex.schema.createTable("asignaciones", function (table) {
    table.increments("id").primary();
    table.integer("activo_id").unsigned().notNullable();
    table.integer("persona_id").unsigned().notNullable();
    table.integer("cargo_id").unsigned().notNullable();

    table.date("fecha_inicio").notNullable();
    table.date("fecha_fin").nullable();
    table.string("condicion_entrega", 250).notNullable();
    table.string("condicion_devolucion", 250).nullable();

    table.string("informe_pdf", 250);
    table.timestamp("fecharegistro").defaultTo(knex.fn.now()); // Guardamos la fecha

    table.foreign("activo_id").references("id").inTable("activos");
    table.foreign("persona_id").references("id").inTable("personas");
    table.foreign("cargo_id").references("id").inTable("cargos");
  });

  await knex.schema.createTable("movimientos", function (table) {
    table.increments("id").primary();

    table.integer("activo_id").unsigned().notNullable();
    table.integer("area_origen_id").unsigned().nullable();
    table.integer("area_destino_id").unsigned().notNullable();
    table.integer("usuario_id").unsigned().notNullable();

    table.dateTime("fecha_movimiento").notNullable().defaultTo(knex.fn.now());
    table.string("motivo", 250).nullable();

    table.foreign("activo_id").references("id").inTable("activos");
    table.foreign("area_origen_id").references("id").inTable("areas");
    table.foreign("area_destino_id").references("id").inTable("areas");
    table.foreign("usuario_id").references("id").inTable("usuarios");
  });

  await knex.schema.createTable("mantenimientos", function (table) {
    table.increments("id").primary();
    table.integer("activo_id").unsigned().notNullable();
    table.enu("tipo", ["preventivo", "correctivo"]).notNullable();

    table.date("fecha").notNullable();
    table.string("descripcion", 250).notNullable();
    table.text("observaciones").nullable();
    table.decimal("costo", 10, 2).notNullable().defaultTo(0);
    table.timestamp("fecharegistro").defaultTo(knex.fn.now()); // Guardamos la fecha

    table.foreign("activo_id").references("id").inTable("activos");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("movimientos");
  await knex.schema.dropTableIfExists("mantenimientos");
  await knex.schema.dropTableIfExists("asignaciones");
  await knex.schema.dropTableIfExists("activos");
  await knex.schema.dropTableIfExists("usuarios");
  await knex.schema.dropTableIfExists("cargos");
  await knex.schema.dropTableIfExists("categorias");
  await knex.schema.dropTableIfExists("marcas");
  await knex.schema.dropTableIfExists("areas");
  await knex.schema.dropTableIfExists("personas");
};

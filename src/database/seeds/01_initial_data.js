/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {

  // Deletes ALL existing entries
  await knex('areas').del();
  await knex('marcas').del();
  await knex('categorias').del();
  await knex('cargos').del();
  await knex('usuarios').del();
  await knex('activos').del();
  await knex('asignaciones').del();

  await knex('areas').insert([
    {nombre: 'Almacen'},
    {nombre: 'Logistica'},
    {nombre: 'Sistemas'},
    {nombre: 'Inversiones'},
    {nombre: 'Taller'},
    {nombre: 'Recursos Humanos'},
    {nombre: 'Administracion'},
    {nombre: 'Cobranzas'},
    {nombre: 'Contabilidad'}
  ]);

  await knex('marcas').insert([
    {nombre: 'HP'},
    {nombre: 'Dell'},
    {nombre: 'Lenovo'},
    {nombre: 'Asus'},
    {nombre: 'Acer'},
    {nombre: 'Samsung'},
    {nombre: 'LG'}
  ]);

  await knex('categorias').insert([
    {nombre: 'Laptop'},
    {nombre: 'Desktop'},
    {nombre: 'Monitor'},
    {nombre: 'Impresora'},
    {nombre: 'Router'},
    {nombre: 'Switch'},
    {nombre: 'Proyector'}
  ]);

  await knex('cargos').insert([
    {area_id: 1, nombre: 'Jefe de Almacen'},
    {area_id: 2, nombre: 'Jefe de Logistica'},
    {area_id: 3, nombre: 'Jefe de Sistemas'},
    {area_id: 4, nombre: 'Jefe de Inversiones'},
    {area_id: 5, nombre: 'Jefe de Taller'},
    {area_id: 6, nombre: 'Jefe de Recursos Humanos'},
    {area_id: 7, nombre: 'Jefe de Administracion'},
    {area_id: 8, nombre: 'Jefe de Cobranzas'},
    {area_id: 9, nombre: 'Jefe de Contabilidad'}
  ]);  

  await knex('usuarios').insert([
    {persona_id: 1, username: 'admin', password: 'admin123', rol: 'admin'},
    {persona_id: 2, username: 'usuario1', password: 'usuario123', rol: 'usuario'},
  ]);

  


};

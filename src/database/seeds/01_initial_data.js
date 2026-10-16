/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('areas').del()

  


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


};

const knex = require('knex');
const knexfile = require('../../knexfile');

// Selecionamos el entorno (production / development)
const enviroment = process.env.NODE_ENV;
const configOptions = knexfile[enviroment];

// Creamos la instancia
const db = knex(configOptions)

// Exportamos el archivo
module.exports = db;
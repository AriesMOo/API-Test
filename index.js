'use strict';

const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

// Configuramos conexion con BBDD, a traves de mongoose (si no existe la BBDD se crea en el primer POST -en este caso shop-)
mongoose.connect(config.db, (err, res) => {
  if (err) 
    return console.error(`Error al conectar con la BBDD: ${err}`);
  else 
    console.log('Conexión a BBDD establecida...');
});

// Arrancamos la aplicacion en el puerto especificado
app.listen(config.port, () => {
	console.log(`Esto marcha en http://localhsot:${config.port}`);
});

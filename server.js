'use strict';

const util           = require('util'); // De node.js
const express        = require('express');
const mongoose       = require('mongoose');
const bodyParser     = require('body-parser'); // Para parsear peticiones HTTP
const morgan         = require('morgan');
const sriracha       = require('sriracha');
const debug          = require('debug')('stockApp:server.js');
const debugMongoose  = require('debug')('mongoose');
const apiRouter      = require('./routes/apiRoutes');
const generalRouter  = require('./routes/generalRoutes');
const authUserRouter = require('./routes/authUserRoutes');
const config         = require('./config/config');

const app = express();

// Configuramos express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/admin', sriracha());

// Si estamos en un entorno de desarrollo (no de produccion)
if (!config.production){
  debug('La aplicacion esta corriendo en modo DESARROLLO (con mensajes de debug)');
  // mongoose.set('debug', true);
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debugMongoose('%s.%s(%s, %O)', collectionName, method, util.inspect(query, false, 20, true), doc);
    // debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}


// Asignamos las promesas standard de node (ES6) para que mongoose las use
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

// Configuramos conexion con BBDD, a traves de mongoose (si no existe la BBDD se crea en el primer POST -en este caso shop-)
// mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
// mongoose.connection.on('error', () => {
//   throw new Error(`unable to connect to database: ${config.db}`);
// });
mongoose.connect(config.db, (err, res) => {
  if (err)
    return console.error(`Error al conectar con la BBDD: ${err}`);
  else
    console.log('Conexión a BBDD establecida...');
});

// Configuramos el/los routers segun rutas base para express
app.use('/', generalRouter);
app.use('/api', apiRouter);
app.use('/user', authUserRouter);

// Arrancamos la aplicacion en el puerto especificado
app.listen(config.port, () => {
	console.log(`Esto marcha en http://localhsot:${config.port}`);
});
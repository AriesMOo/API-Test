'use strict';

const util           = require('util'); // De node.js
const express        = require('express');
const mongoose       = require('mongoose');
const bodyParser     = require('body-parser'); // Para parsear peticiones HTTP
const morgan         = require('morgan');
const sriracha       = require('sriracha');
const log4js         = require('log4js'); // Para sustituir a Morgan. Usado en app.use()
const logger         = require('./config/log4js.config').getDefaultLogger();
const apiRouter      = require('./routes/apiRoutes');
const generalRouter  = require('./routes/generalRoutes');
const authUserRouter = require('./routes/authUserRoutes');
const config         = require('./config/config');

const app = express();

// Configuracion generica de Exprss
app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());
app.use(log4js.connectLogger( logger, { level: 'auto' }) );

// Si estamos en un entorno de desarrollo (no de produccion)
if (!config.production){
  logger.setLevel('TRACE'); // Solo local. A nivel global esta en ./config/log4js

  logger.info('La aplicacion esta corriendo en modo DESARROLLO (con mensajes de debug)');
  app.use('/admin', sriracha());
  // app.use(morgan('dev'));

  // mongoose.set('debug', true);
  mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.trace('%s.%s(%s, %O)', collectionName, method, util.inspect(query, false, 20, true), doc);
    // debugMongoose('%s.%s(%s, %O)', collectionName, method, util.inspect(query, false, 20, true), doc);
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

// Configuramos routers con rutas base. A veces pude dar problemas si se hace antes/despuesde otros modulos
app.use('/', generalRouter);
app.use('/api', apiRouter);
app.use('/user', authUserRouter);

// Arrancamos la aplicacion en el puerto especificado
app.listen(config.port, () => {
	console.log(`Esto marcha en http://localhsot:${config.port}`);
});
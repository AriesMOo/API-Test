'use strict';

require('babel-core/register');
require('babel-polyfill'); // Para poder utilizar todos las cosas pepis de ES2015,2016 y 2017 via babel.js

const express            = require('express');
const mongoose           = require('mongoose');
const bodyParser         = require('body-parser'); // Para parsear peticiones HTTP
const morgan             = require('morgan');
const sriracha           = require('sriracha');
const logger             = require('./config/log4js.config').getLogger('InicioApp'); // .getDefaultLogger();
const authController     = require('./controllers/user');
const config             = require('./config/config');

// Routers
const generalRouter      = require('./routes/generalRoutes');
const apiRouter          = require('./routes/apiRoutes');
const redesRouter        = require('./components/redes/redes.route');
const dispositivosRouter = require('./components/dipositivos/dispositivos.route');
const authUserRouter     = require('./routes/authUserRoutes');

const loggerFichero      = require('./config/log4js.config').getLogger('stockApp');

const app = express();

// Configuracion generica de Exprss
app.use(bodyParser.urlencoded( { extended: false } ));
app.use(bodyParser.json());

// Si estamos en un entorno de desarrollo (no de produccion)
if (!config.production){
  logger.setLevel('TRACE'); // Solo local. A nivel global esta en ./config/log4js

  logger.info('La aplicacion esta corriendo en modo DESARROLLO (con mensajes de debug)');
  app.use('/admin', sriracha());
  // app.use(log4js.connectLogger( logger, { level: 'auto' }) ); // Alternativa a Morgan (casi lo mismo) usando log4js
  app.use(morgan('dev'));

      // -> mongoose.set('debug', true);
  /* mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.trace('%s.%s(%s, %O)', collectionName, method, util.inspect(query, false, 20, true), doc);
    // debugMongoose('%s.%s(%s, %O)', collectionName, method, util.inspect(query, false, 20, true), doc);
    // debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });*/
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
    return loggerFichero.error(`Error al conectar con la BBDD: ${err}`);
  else
    logger.info('Conexión a BBDD establecida...');
});

// Configuramos routers con rutas base. A veces pude dar problemas si se hace antes/despuesde otros modulos
app.use('/', generalRouter);
app.use('/api', apiRouter);
app.use('/api', redesRouter);
app.use('/api', dispositivosRouter);
app.use('/api', express.Router().all('*', authController.ensureAuthenticationMiddleware));
app.use('/user', authUserRouter);

// Arrancamos la aplicacion en el puerto especificado
app.listen(config.port, () => {
	logger.info(`Esto marcha en http://localhsot:${config.port}`);
  // loggerFichero.info('esto ye la hostia oh !! '); // Esto no se logea (nivel por defect ERROR)
  // loggerFichero.error('esto ye un error de la hostia né !! '); // Esto si (a consola y a fichero)
});
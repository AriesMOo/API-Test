'use strict';

const express        = require('express');
const mongoose       = require('mongoose');
const bodyParser     = require('body-parser'); // Para parsear peticiones HTTP
const morgan         = require('morgan');
const sriracha       = require('sriracha');
const winston        = require('winston');
const expressWinston = require('express-Winston');
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
  app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        })
      ],
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
  }));

  mongoose.set('debug', true);
}


// Asignamos las promesas standard de node (ES6) para que mongoose las use
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

// Configuramos conexion con BBDD, a traves de mongoose (si no existe la BBDD se crea en el primer POST -en este caso shop-)
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

// Configruamos winston para logear los errores (despues de los routers claro)
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

// Arrancamos la aplicacion en el puerto especificado
app.listen(config.port, () => {
	console.log(`Esto marcha en http://localhsot:${config.port}`);
});
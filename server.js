'use strict';

const express        = require('express');
const mongoose       = require('mongoose');
const bodyParser     = require('body-parser'); // Para parsear peticiones HTTP 
const morgan         = require('morgan');
const sriracha       = require('sriracha');
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

// Configuramos el/los routers segun rutas base para express
app.use('/', generalRouter);
app.use('/api', apiRouter);
app.use('/user', authUserRouter);

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
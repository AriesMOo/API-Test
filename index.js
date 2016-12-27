'use strict';

const express = require('express');
const bodyParser = require('body-parser'); // Para parsear peticiones HTTP 

// Creamos la app express en cuestion y guardamos un puerto para correrlo
const app = express();
const port = process.env.PORT || 3000;

// Le decimos que use el body parser para el tema de las peticiones
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Arrancamos la aplicacion en el puerto especificado
app.listen(port, () => {
	console.log(`Esto marcha en http://localhsot:${port}`);
});

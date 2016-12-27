'use strict';

const express = require('express');
const bodyParser = require('body-parser'); // Para parsear peticiones HTTP 

// Creamos la app express en cuestion y guardamos un puerto para correrlo
const app = express();
const port = process.env.PORT || 3000;

// Le decimos que use el body parser para el tema de las peticiones
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

	// -- VERBOS -- //
app.get('/hola', (req, res) =>
	res.send({ message: 'Hello motto !' }) // En formato json y todo hoyga
);										   // req = request (peticion) - res = response (respuesta)
app.get('/hola/:name', (req, res) =>  	   // localhost:3000/hola/pozno
	res.send(`hola ${req.params.name}`)    // Aqui va en 'bruto'
);										   // Los nombres de los params son los que se ponen arriba 

// Arrancamos la aplicacion en el puerto especificado
app.listen(port, () => {
	console.log(`Esto marcha en http://localhsot:${port}`);
});

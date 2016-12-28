'use strict';

const express = require('express');
const bodyParser = require('body-parser'); // Para parsear peticiones HTTP 

// Creamos la app express en cuestion y guardamos un puerto para correrlo
const app = express();
const port = process.env.PORT || 3000;

// Le decimos que use el body parser para el tema de las peticiones
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// VERBOS
// ---------------------------------------------------------

// Ruta por defecto (/)
app.get('/', (req, res) => {
	res.send({ message: 'Hello motto !!' });  // Se manda una respuesta JSON
});

// Ruta con parametro (:name) en /hola/
app.get('/hola/:name', (req, res) => {
	res.send(`Hello tronco-${req.params.name}`);  // Respuesta en tipo plano
});

// ---------------------------------------------------------


// Arrancamos la aplicacion en el puerto especificado
app.listen(port, () => {
	console.log(`Esto marcha en http://localhsot:${port}`);
});

// TODO: instalar mongoose 
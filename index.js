'use strict';

const express = require('express');
const bodyParser = require('body-parser'); // Para parsear peticiones HTTP 
const mongoose = require('mongoose');

// Creamos la app express en cuestion y guardamos un puerto para correrlo
const app = express();
const port = process.env.PORT || 3000;

// Le decimos que use el body parser para el tema de las peticiones
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// VERBOS
// ---------------------------------------------------------

// Ruta por defecto (/)
    /* app.get('/', (req, res) => {
      res.send({ message: 'Hello motto !!' });  // Se manda una respuesta JSON
    });

    // Ruta con parametro (:name) en /hola/
    app.get('/hola/:name', (req, res) => {
      res.send(`Hello tronco-${req.params.name}`);  // Respuesta en texto plano
    }); */

app.get('/api/products', (req, res) => {
  res.status(200).send({ products: [] });    // Se devuelve un 200 (OK) y un body JSON
});

app.get('/api/product/:productId', (req, res) => {

});

app.post('/api/product', (req, res) => {
  console.log(req.body);
  res.status(200).send({ message: 'El producto se ha recibido' });
});     // se logea el body que se envia desde el cliente y se le envia un 200 y un json

app.put('/api/product/:productId', (req, res) => {

});

app.delete('/api/product/:productId', (req, res) => {

});

// ---------------------------------------------------------

// Configuramos conexion con BBDD, a traves de mongoose
mongoose.connect('mongodb://localhost:27017/shop', (err, res) => {
  if (err) 
    return console.error('Error al conectar con la BBDD');
  else 
    console.log('Conexión a BBDD establecida...');
});

// Arrancamos la aplicacion en el puerto especificado
app.listen(port, () => {
	console.log(`Esto marcha en http://localhsot:${port}`);
});

// TODO: instalar mongoose 
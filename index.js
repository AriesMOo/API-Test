'use strict';

const express = require('express');
const bodyParser = require('body-parser'); // Para parsear peticiones HTTP 
const mongoose = require('mongoose');

// Importamos modelos mongoose (ojo, al no ser paquetes npm, hay que especificar la ruta en el require)
const Product = require('./models/product');

// Creamos la app express en cuestion y guardamos un puerto para correrlo
const app = express();
const port = process.env.PORT || 3000;

// Le decimos que use el body parser para el tema de las peticiones
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// VERBOS (Rutas)
// ---------------------------------------------------------

// Ruta por defecto (/)
app.get('/', (req, res) => {
  res.send('<p>Yo creo que quieres ir a <a href="http://localhost:3000/api/products">la API</a></p>');  // Se manda una respuesta JSON
});

// Rutas de API
app.get('/api/product/:productId', (req, res) => {
  console.log('GET desde /api/produc/id');

  // Guardamos el ID que viene como ruta /api/product/añlsfañslfj
  let productId = req.params.productId;

  // Consultamos a la BBDD (callback con err y producto devuelto)
  Product.findById(productId, (err, product) => {
    if (err)  // Si hay un error, 500 y fuera
      return res.status(500).send({ message: `Error al realizar la petición a la BBDD: ${err}` });
    if (!product)  // Si no encuentra el producto, 404 y fuera
      return res.status(404).send({ message: 'El producto no existe' });

    res.status(200).send({ product });  // Si llega aqui es que ha encontrado el producto por el ID
  });
});

app.get('/api/products', (req, res) => {
  // Es parecida a la funcion anterior
  Product.find({}, (err, products) => {
    if (err)
      return res.status(500).send({ message: `Error al realizar la consulta a la BBDD: ${err}` });
    if (!products)
      return res.status(404).send({ message: 'No hay productos guardados todavía' });

    res.send(200, { products });
  });
});

app.post('/api/product', (req, res) => {
  console.log('POST desde /api/product');
  console.log(req.body);

  // Creamos un producto
  let product = new Product();
  product.name = req.body.name;
  product.picture = req.body.picture;
  product.price = req.body.price;
  product.category = req.body.category;
  product.description = req.body.description;
  
  // Se salva el producto (callback con error - objetosalvado)
  product.save((err, productStored) => {
    if (err)
      res.status(500).send({ message: `Error al salvar en la BBDD: ${err}` });
    else 
      res.status(200).send({ message: productStored });
  });
});

app.put('/api/product/:productId', (req, res) => {

});

app.delete('/api/product/:productId', (req, res) => {

});

// ---------------------------------------------------------

// Configuramos conexion con BBDD, a traves de mongoose (si no existe la BBDD se crea en el primer POST -en este caso shop-)
mongoose.connect('mongodb://localhost:27017/shop', (err, res) => {
  if (err) 
    return console.error(`Error al conectar con la BBDD: ${err}`);
  else 
    console.log('Conexión a BBDD establecida...');
});

// Arrancamos la aplicacion en el puerto especificado
app.listen(port, () => {
	console.log(`Esto marcha en http://localhsot:${port}`);
});

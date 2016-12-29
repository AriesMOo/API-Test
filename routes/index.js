'use strict';

const express = require('express');
const api = express.Router();
const productController = require('../controllers/product');

// Ruta por defecto (/)
api.get('/', (req, res) => {
  res.send('<p>Yo creo que quieres ir a <a href="http://localhost:3000/api/products">la API</a></p>');  // Se manda una respuesta JSON
});
// Rutas de API
api.get('/product/:productId', productController.getProduct);
api.get('/products', productController.getProducts);
api.post('/product', productController.saveProduct);
api.delete('/product/:productId', productController.deleteProduct);
api.put('/product/:productId', productController.updateProduct);

module.exports = api;

// NOTE: OJO !! el nombre del router es lo que se antepone a la direccion. En este caso
// como se llama api, las direcciones son localhost/api/products, etc.
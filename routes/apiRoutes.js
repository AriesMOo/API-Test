'use strict';

const express = require('express');
const config = require('../config/config');
const productController = require('../controllers/product');
const apiRouter = express.Router();

// Ruta por defecto (/) que al estar aqui ahora se refiere a localhost/api
apiRouter.get('/', (req, res) => {
  res.status(200)
     .send(`<h2>API Directory</h2>
            <ul>
              <li><a href="http://localhost:${config.port}/api/products">Products</a></li>              
            </ul>`);
});
// Rutas de API
apiRouter.get('/product/:productId', productController.getProduct);
apiRouter.get('/products', productController.getProducts);
apiRouter.post('/product', productController.saveProduct);
apiRouter.delete('/product/:productId', productController.deleteProduct);
apiRouter.put('/product/:productId', productController.updateProduct);

module.exports = apiRouter;

// NOTE: OJO !! en app.js usamos esta ruta especificando que todas cuelgan de 
// /api, asi que todas las rutas de aqui son paara localhost/api/products, etc.
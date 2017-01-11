'use strict';

const express               = require('express');
const config                = require('../config/config');
const productController     = require('../controllers/product');
const authController        = require('../controllers/user');
const dispositivoController = require('../controllers/dispositivo.controller');
const lugaresController     = require('../controllers/lugar.controller.js');
const apiRouter             = express.Router();

// Ruta por defecto (/) que al estar aqui ahora se refiere a localhost/api
apiRouter.get('/', (req, res) => {
  res.status(200)
     .send(`<h2>API Directory</h2>
            <ul>
              <li><a href="http://localhost:${config.port}/api/products">Products</a></li>              
              <li><a href="http://localhost:${config.port}/api/dispositivos">Dispositivos</a></li>
              <li><a href="http://localhost:${config.port}/api/eaps">EAPs (lugares)</a></li>                                          
            </ul>`);
});

/* test  */ 
apiRouter.get('/testAggregation', dispositivoController.testAggregation);
apiRouter.get('/dispositivos', dispositivoController.getDispositivos);
apiRouter.post('/dispositivo', dispositivoController.saveDispositivo);
apiRouter.get('/eaps', lugaresController.getLugares);
apiRouter.post('/eap', lugaresController.saveLugar);
apiRouter.put('/eap/:lugarID', lugaresController.updateLugar);
/** test */

// Rutas de API
apiRouter.all('*', authController.ensureAuthenticationMiddleware);
// Se protegen todas las rutas (apiRouter.all) 
apiRouter.get('/product/:productId', productController.getProduct);
apiRouter.get('/products', productController.getProducts);
apiRouter.post('/product', productController.saveProduct);
apiRouter.delete('/product/:productId', productController.deleteProduct);
apiRouter.put('/product/:productId', productController.updateProduct);

module.exports = apiRouter;

// NOTE: OJO !! en app.js usamos esta ruta especificando que todas cuelgan de 
// /api, asi que todas las rutas de aqui son paara localhost/api/products, etc.
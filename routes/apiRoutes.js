'use strict';

const express                = require('express');
const config                 = require('../config/config');
const productController      = require('../controllers/product');
const authController         = require('../controllers/user');
const dispositivoController  = require('../controllers/dispositivo.controller');
const centrosSaludController = require('../controllers/lugar.controller.js');
const apiRouter              = express.Router();

const consultorioModel       = require('../models/EAPs/consultorio.model');

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
apiRouter.post('/dispositivos', dispositivoController.saveDispositivo);

apiRouter.route('/centros-salud')
  .get(centrosSaludController.getLugares)
  .post(centrosSaludController.save);
apiRouter.route('/centros-salud/:lugarID')
  .get(centrosSaludController.getLugarConcreto)
  .put(centrosSaludController.update)
  .patch(centrosSaludController.patch);
  // .delete(lugaresController.deleteProduct);

apiRouter.route('/consultorios')
  .get(function (req, res) {
    consultorioModel.find({ '__t': { '$exists': false } })
      .then(lugares => {
        if (lugares.length == 0)
          return res.status(404).send({ message: 'No hay consultorios' });

        res.status(200).send(lugares);
      })
      .catch(err => res.status(500).send({ err }) );
  })
  .post(function (req, res) {
      let nuevoLugar = new consultorioModel(req.body);
      nuevoLugar.audit._actualizdoPorID = req.userID; // Si no viene no hay problema

      nuevoLugar.save()
        .then(lugarGuardado => res.status(200).send({ lugarGuardado }) )
        .catch(err => res.status(500).send({ message: `No se ha podido guardar en la BBDD. ${err}` }) );
    }
  );

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
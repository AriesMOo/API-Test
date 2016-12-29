'use strict';

const express       = require('express');
const generalRouter = express.Router();
const config        = require('../config/config');

// Ruta por defecto (/) que al estar aqui ahora se refiere a localhost/api
generalRouter.get('/', (req, res) => {
  res.status(200)
     .send(`<h1>API pow@ here !! [testing hoyga]</h1>
            <ul>
              <li><a href="http://localhost:${config.port}/api">API directory</a></li>
              <li><a href="http://localhost:${config.port}/api/products">Products</a></li>              
            </ul>`);
});

module.exports = generalRouter;

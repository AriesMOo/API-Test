'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // Para parsear peticiones HTTP 
const api = require('./routes/index');

// Le decimos que use el body parser para el tema de las peticiones
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', api);

module.exports = app;

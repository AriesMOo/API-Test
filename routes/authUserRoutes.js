'use strict';

const express        = require('express');
const userController = require('../controllers/user');
const authUserRouter = express.Router();

// Rutas de login/logout y relacionadas con authUserRouter
// Se permite acceso a salvar (registrar) usuarios sin autenticarse
authUserRouter.post('/', userController.saveUser);
authUserRouter.post('/authenticate', userController.authenticate);

// Se protegen las rutas restantes
authUserRouter.all('*', userController.ensureAuthenticationMiddleware);
authUserRouter.get('/', userController.getUsers);
authUserRouter.get('/:userId', userController.getUser);

module.exports = authUserRouter;

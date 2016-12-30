'use strict';

const express = require('express');
const userController = require('../controllers/user');
const authUserRouter = express.Router();

// Rutas de login/logout y relacionadas con authUserRouter
authUserRouter.get('/', userController.getUsers);
authUserRouter.get('/:userId', userController.ensureAuthenticationMiddleware, userController.getUser);
authUserRouter.post('/', userController.saveUser);
authUserRouter.post('/authenticate', userController.authenticate);

module.exports = authUserRouter;

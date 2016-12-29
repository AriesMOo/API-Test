'use strict';

const express = require('express');
const userController = require('../controllers/user');
const authUserRouter = express.Router();

// Rutas de login/logout y relacionadas con authUserRouter
authUserRouter.get('/', userController.getUsers);
authUserRouter.post('/', userController.saveUser);
authUserRouter.post('/login', userController.loginUser);
authUserRouter.post('/logout', userController.logoutUser);
authUserRouter.get('/:userId', userController.getUser);

module.exports = authUserRouter;

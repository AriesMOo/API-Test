'use strict';

const jwt       = require('jwt-simple');
const moment    = require('moment');
const userModel = require('../models/user');
const jwtConfig = require('../config/jwt.config');

function getUsers (req, res){
	userModel.find({}, (err, users) => {
		if (err)
			return res.status(500).send({ message: `Error al realizar la consulta a la BBDD: ${err}` });
		if (!users || users.length == 0)
			return res.status(404).send({ message: 'No hay usuarios guardados todavía' });

		res.status(200).send({ users });
	});
}

function getUser (req, res) {
	res.status(200).send({ message: `stub message para ${req.params.userId}` });
}

function saveUser (req, res){
	let newUser = new userModel();
	let passw = req.body.password;

	newUser.email = req.body.email;
	if (passw.length > 3)
		newUser.password = passw;
	else 
		return res.status(500).send({ message: 'Error: El password es demasiado corto' });

	newUser.save((err, userStored) => {
		if (err)
			return res.status(500).send({ message: `Error al salvar en la BBDD: ${err}` });
		else 
			res.status(200).send({ user: userStored, token: authService.createJwtToken(userStored) });
	});
}

// Es un sinonimo de getToken en realidad
function authenticate (req, res) { 
	let email = req.body.email;
	let password = req.body.password;

	if (!(email && password)) // NOTE: ojo al error comun: sin el parentesis !() traga con uno que vaya y no es el comportamiento deseado
		return res.status(400).send({ message: 'Error: No se ha especificado correctamente email y password' });
	
	userModel.findOne({ 'email': email }, (err, user) => { 
		if (err) 
			return res.status(500).send({ message: `Error al realizar peticion a la BBDD: ${err}` });		
		if (!user)
			return res.status(403).send({ messge: 'No hay usuarios con el email especificado' });
		
		// Si llega aqui se supone que hay un usuario con el mail pasadso en la BBDD
		user.comparePassword(password, (err, coincide) => {
			if (err)
				return res.status(500).send({ message: `Error al realizar la peticion a la BBDD: ${err}` });
			if (!coincide)
				return res.status(401).send({ message: 'User/password no valido' });
			
			return res.status(200).send({ token: authService.createJwtToken(user._id) });
		});

	});

}

/**
 * Middleware pensado para su uso en rutas.
 * Se asegura de que hay token en la peticion y de  que sea valido segun la clave 
 * almacenada en el servidor.
 * Si todo va bien anade a la peticion (req) el ID del usuario propietario del token
 * y delega el control en el siguiente middleware o al router si no hay mas
 */
function ensureAuthenticationMiddleware (req, res, next) {
	if (!req.headers.authorization && !req.body.token && !req.query.token) // TODO: OJO aqui quitar el body.token, pq luego en A2 lo impelmentare solo con headers
		return res.status(403).send({ message: 'Sin token de autenticacion...' });
	
	let tokenHeader = req.headers.authorization; // EL token en los headers viene en forma >> Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbsciOiJIUzI1NiJ9. 
	let token = tokenHeader ? tokenHeader.split(' ')[1] : req.body.token; // Asignacion ternaria para coger el token en los headers (partirlo por espacios y quedarse 2º cacho -firma token-) o el token pasado en el body
	let payload = jwt.decode(token, jwtConfig.TOKEN_SECRET);

	if (payload.exp <= moment().unix())
		return res.status(401).send({ message: 'El token ha expirado' });

	req.userId = payload.sub;	// NOTE: se añade el id del usuario (decodificado del token y ya validado)
	next();
}

module.exports = {
	getUser,
	getUsers,
	saveUser,
	authenticate,
	ensureAuthenticationMiddleware
};

// Funciones no exportadas a priori (locales, para ayuda)
// ------------------------------------------------------
// En este caso creamos un objeto con funciones en plan old-js-school
const authService = {
	createJwtToken: (user) => {
		let payload = {
			sub: user._id,			// sub = id del sujeto del token
			iat: moment().unix(), 	// iat = fecha creacion (en formato UNIX con momentjs)
			exp: moment().add(10, 'days').unix() 	// exp = fecha expiracion token (14 dias a contar desde la creacion con moment.js)
		};

		return jwt.encode(payload, jwtConfig.TOKEN_SECRET);
	}
};


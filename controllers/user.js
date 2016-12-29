'use strict';

const userModel = require('../models/user');

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
			res.status(200).send({ user: userStored, token: //TODO: pendiente la magia de JWT aqui });
	});
}

function loginUser (req, res) {

}

function logoutUser (req, res) {

}


module.exports = {
	getUser,
	getUsers,
	saveUser,
	loginUser,
	logoutUser
};

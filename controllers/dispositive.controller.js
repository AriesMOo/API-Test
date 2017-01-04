'use strict';

const ipOps            = require('ip');
const dispositiveModel = require('../models/dispositivo.model');

function getDispositives (req, res) {
    dispositiveModel.find({}, (err, dispositives) => {
        if (!dispositives)
            return res.status(404).send({ message: 'No hay dispositivos' });
    
        res.status(200).send({ dispositives });
    });
}

function saveDispositive (req, res) {
    let newDispositive = new dispositiveModel();
	let name = req.body.name;
    let ip = req.body.ip;

	if (name && ip){
        newDispositive.name = name;
        newDispositive.IPs.push({ IP: ipOps.toLong(ip), networkID: 'añlskjfañlksfj' }); // FIXME: aqui debe ir un id de una red que exista en la app !
    } else 
		return res.status(400).send({ message: 'Error: No se han proporcionado los datos necesarios (nombre e IP)' });

	newDispositive.save((err, dispositiveStored) => {
		if (err)
			return res.status(500).send({ message: `Error al salvar en la BBDD: ${err}` });
		else 
			res.status(200).send({ dispositive: dispositiveStored });
	});
}

module.exports = {
    getDispositives,
    saveDispositive
};

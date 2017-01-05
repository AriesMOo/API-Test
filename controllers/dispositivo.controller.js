'use strict';

const ipOps            = require('ip');
const dispositivoModel = require('../models/dispositivo.model');

function getDispositivos (req, res) {
    dispositivoModel.find({}, (err, dispositives) => {
        if (!dispositives || dispositives.length == 0)
            return res.status(404).send({ message: 'No hay dispositivos' });
    
        res.status(200).send({ dispositives });
    });
}

function saveDispositivo (req, res) {
    let newDispositivo = new dispositivoModel();
    let userID = req.userID; // TODO: incluir en el audit. Siempre habra un userID por el ensureAuthentication

    let nombre  = req.body.nombre;
    let ip    = req.body.ip;
    let redID = req.body.redID;

	if (nombre && ip && redID){
        newDispositivo.nombre = nombre;
        newDispositivo.IPs.push({ IP: ipOps.toLong(ip), networkID: redID });
        newDispositivo.audit._creadoPorID = userID;
    } else 
		return res.status(400).send({ message: 'Error: No se han proporcionado los datos necesarios (nombre, IP y/o ID de la red)' });

    console.log(newDispositivo); // FIXME: crea uno pero no puedo meter mas de uno siempre da error de clave duplicada
	newDispositivo.save((err, dispositivoStored) => {
		if (err)
			return res.status(500).send({ message: `Error al salvar en la BBDD: ${err}` });
		else 
			res.status(200).send({ dispositivo: dispositivoStored });
	});
}

module.exports = {
    getDispositivos,
    saveDispositivo
};

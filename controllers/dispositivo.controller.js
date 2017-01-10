'use strict';

const ipOps            = require('ip');
const mongoose         = require('mongoose');
const lugarModel       = require('../models/lugar.model.js');
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
        /* lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId(redID) }, (err, lugar) => {
            if (!lugar)
                return res.status(400).send({ message: 'Error: El id de la red facilitada no existe en la BBDD.' });
        });*/
        newDispositivo.IPs.push({ IP: ipOps.toLong(ip), networkID: redID });
        newDispositivo.nombre = nombre;
        newDispositivo.audit._creadoPorID = userID;
    } else 
		return res.status(400).send({ message: 'Error: No se han proporcionado los datos necesarios (nombre, IP y/o ID de la red)' });

	newDispositivo.save((err, dispositivoStored) => {
		if (err)
			return res.status(500).send({ message: `Error al salvar en la BBDD: ${err}` });
		else 
			res.status(200).send({ dispositivo: dispositivoStored });
	});
}

function testAggregation (req, res) {
    /* lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId('586e4f070d061f2688a76d82') }, (err, lugar) => {
        res.status(200).send(lugar);
    }); */
    lugarModel.aggregate(
        [ 
            { $unwind:  '$redes' },
            // { $project: { redes: 1 } },
            { $match: { 'redes._id': mongoose.Types.ObjectId('586e4f070d061f2688a76d00') } }
        ])
        .exec(function (err, result) {
            res.status(200).send({ message: result });
        });
}

module.exports = {
    getDispositivos,
    saveDispositivo,
    testAggregation
};

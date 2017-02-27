'use strict';

const ipOps            = require('ip');
const mongoose         = require('mongoose');
const centroSaludModel = require('../models/consultorio.model').centroSaludModel;
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
        /* centroSaludModel.findOne({ 'redes._id': mongoose.Types.ObjectId(redID) }, (err, lugar) => {
            if (!lugar)
                return res.status(400).send({ message: 'Error: El id de la red facilitada no existe en la BBDD.' });
        });*/
        newDispositivo.IPs.push({ IP: ipOps.toLong(ip), networkID: redID });
        newDispositivo.nombre = nombre;
        // newDispositivo.audit._creadoPorID = userID;
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
    // Asi busca por networkID y devuelve el objeto completo (con el array de redes). Si hay 3 redes, 3 objetos red devuelve dentro de redes[]
    /* centroSaludModel.findOne({ 'redes._id': mongoose.Types.ObjectId('586e4f070d061f2688a76d82') }, (err, lugar) => {
        res.status(200).send(lugar);
    }); */

    // De esta forma devuelve una sola red en redes -> redes { cidr: ,gateway: ,tipo: ,_id_: } que es la del objeto de busqueda
    // Asi se puede acceder directamente a ella de forma mucho mas comoda (aunque la busqueda es mas chunga)
    const netID = '587140348f9d1bc5e56e0e00'; // '586e4f070d061f2688a76d00';

    centroSaludModel.find({}, (err, lugares) => {
        console.log(lugares.redes);
    });

    centroSaludModel.aggregate(
        [
            { $unwind:  '$redes' },
            // { $project: { redes: 1 } },
            { $match: { 'redes._id': mongoose.Types.ObjectId(netID) } }
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

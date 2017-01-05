'use strict';

const ipOps      = require('ip');
const lugarModel = require('../models/lugar.model');

function getLugares (req, res) {
    lugarModel.find({}, (err, lugares) => {
        if (!lugares || lugares.length == 0) 
            return res.status(404).send({ message: 'No hay centros/consultorios' });

        res.status(200).send(lugares);
    });
}

// TODO: para los telefonos, las redes y los consultorios (y los arrays en general)
// es mejor hacer una funcion aparte (con su ruta adicional) en paln /api/eaps/eapID/actualizarDireccion
// Si hay dos telefonos que poner/actualizar, habria que llamar 2 veces a la ruta desde el front-end/angular
// O en su defecto, trincar la primera directametne, y la 2ª hacerlo con actualizacion
function saveLugar (req, res) {
    let nuevoLugar = new lugarModel();
    let userID = req.userID; // TODO: incluir en el audit. Siempre habra un userID por el ensureAuthentication

    nuevoLugar.esCentroSalud = req.body.esCentroSalud;
    nuevoLugar.codigo = req.body.codigo;
    nuevoLugar.nombre = req.body.nombre;
    nuevoLugar.redes.push({
        cidr: req.body.cidr,
        gateway: ipOps.toLong(req.body.gateway),
        tipo: req.body.tipoRed,
    });

    nuevoLugar.save((err, lugarGuardado) => {
        if (err) return res.status(500).send({ message: `Error: No se ha podido guardar en la BBDD. ${err}` });

        res.status(200).send({ lugar: lugarGuardado });
    });
}

function getLugar (req, res) {
    res.status(200).send({ message: `stub message para ${req.params.lugarID}` });
}

module.exports = {
    getLugares,
    saveLugar,
    getLugar
};
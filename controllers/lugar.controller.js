'use strict';

const ipOps      = require('ip');
const _          = require('lodash');
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
        if (err) 
            return res.status(500).send({ message: `Error: No se ha podido guardar en la BBDD. ${err}` });

        res.status(200).send({ lugar: lugarGuardado });
    });
}

function getLugar (req, res) {
    res.status(200).send({ message: `stub message para ${req.params.lugarID}` });
}

function updateLugar (req, res){
    const lugarID = req.params.lugarID;
    const bodyLugarUpdate = req.body;

    /* lugarModel.findByIdAndUpdate(lugarID, req.body, function (err, post) {
        if (err) return res.status(500).message({ error: `${err}` });
        
        res.json(post);
    });*/

    lugarModel.findById(lugarID, function (err, lugar){
        if (!lugar) 
            return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });
       
        /* TODO: iterar sobre los campos pasados en req.body y para cada uno, 
        validar con cada path que este ok. Si todos estan ok, insertarlos en un 
        objeto nuevo para actualizar hacer un update? */
        
        // Metemos los campos del schema en un array schemaPaths
        let schemaPaths = [];
        lugar.schema.eachPath(function (path){
            schemaPaths.push(path);
        });

        console.log(schemaPaths);
        // Iteramos sobre cada parametro pasado en el body, a ver si esta en el schema
        _.each(req.body, function (value, key){
            console.log(`key: ${key} - value: ${value}`);
            
            const pathEncontrado = _.find(schemaPaths, key);
            // FIXME: -> con esto igual?? for( let i=0; i<schemaPaths.length; i++){}
            if (!pathEncontrado){
                res.status(400).send({ Error: `${key} no existe en la BBDD. No se actualiza nada --> ${pathEncontrado}` });
            }
            /* else 
                lugar.key = value;*/
        });

        // console.log(lugar);
        

        /* lugar.nombre           = req.body.nombre;
        lugar.redes[0].gateway = req.body.gateway; // ipOps.toLong(req.body.gateway);

        lugar.save((err, lugarGuardado) => {
            if (err) 
                return res.status(400).send({ Error: err });

            res.status(200).send({ lugarGuardado });
        });*/


        /* lugar.update(req.body, { runValidators: true }, function (err, lugarUpdated) {
            if (err) 
                return res.status(500).send({ message: `Error al actulizar ${err}` });

            res.status(200).send ({ message: `ok ${lugarUpdated}` });
        });*/
    });
}

module.exports = {
    getLugares,
    saveLugar,
    getLugar,
    updateLugar
};
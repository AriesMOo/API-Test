'use strict';

// NOTA: el comportamiento por defecto cuando se pasan parametros que no forman
// parte del schema (POST, PUT) es IGNORARLOS SIN AVISAR. La respuesta puede ser
// 200 - ok y no haber actualizado nada.
const util       = require('util');
const lugarModel = require('../models/lugar.model');
const logger     = require('../config/log4js.config').getDefaultLogger();

function getLugares (req, res) {
  lugarModel.find({})
    .then(lugares => {
      if (lugares.length == 0)
        res.status(404).send({ message: 'No hay centros/consultorios' });

      res.status(200).send(lugares);
    })
    .catch(err => res.status(500).send({ err }));
}

function getLugarConcreto (req, res) {
    res.status(200).send({ message: `stub message para ${req.params.lugarID}` });
}

function save (req, res) {
  let nuevoLugar = new lugarModel(req.body);
  nuevoLugar.audit._actualizdoPorID = req.userID; // Si no viene no hay problema

  nuevoLugar.save()
    .then(lugarGuardado => res.status(200).send({ lugarGuardado }) )
    .catch(err => res.status(500).send({ message: `Error: No se ha podido guardar en la BBDD. ${err}` }) );
}

function update (req, res){
  const lugarID = req.params.lugarID;

  lugarModel.findById(lugarID)
    .then(lugar => {
      if (!lugar)
        return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });

      // Se saca la info del bodyrequest (la que se haya enviado)
      for (let key in req.body) {
        lugar[key] = req.body[key];
      }
      lugar.audit._actualizdoPorID = req.userID; // Si no viene no pasa nada

      lugar.save()
        .then(lugarGuardado => res.status(200).send({ lugarGuardado }))
        .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err));
}

function patch (req, res) {
  logger.trace('Esta pasando HEADERS -> ' + util.inspect(req.headers, false, 20, true));
  logger.trace('Esta pasando BODY -> ' + util.inspect(req.body, false, 20, true));
  res.status(200).send({ message: '#STUB method -> pozi es un patch' });
}

function deleteLugar (req, res) {
  res.status(200).send({ message: '#STUB method -> es un delete' });
}

// CONSULTORIOS
let consultoriosHandler = {
    anadeConsultorio: function (req, res){
        const consultorioID = req.body.consultorioID;
        const centroID = req.params.lugarID;

        if (!consultorioID)
            return res.status(400).send({ message: 'No se ha suministrado ID de consultorio' });

        lugarModel.findById(consultorioID, function (err, consultorio){
            if (!consultorio)
                return res.status(400).send({ message: 'ID no corresponde con ningun consultorio' });

            if (consultorio.esCentroSalud)
                return res.status(400).send({ message: 'El ID del consultorio es un centro de salud (no se pueden anidar centros de salud)' });
        });

        lugarModel.findById(centroID, function (err, centroSalud){
            if (!centroSalud)
                return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });

            if (!centroSalud.esCentroSalud)
                return res.status(400).send({ message: 'El ID del EAP es un consultorio y no puede tener asociados otros consultorios' });
                // TODO: pasar este metodo a validators del model con isNew (recorrer todos los consultoriosID y si algunos es isNew revisar que )
                // NO NO, mejor comprobar que si hay consultorios, sea pq el flag esCentroSalud es igual a true

            console.log(centroSalud);
            centroSalud._consultorios.push(consultorioID);
            console.log('==================');
            console.log(centroSalud);
            centroSalud.save(function (err,centroGuardado){
                if (err)
                    return res.status(500).send({ Error: `Problema al guardar el documento en la BBDD --> ${err}` });

                res.status(200).send({ centroGuardado });
            });

        });
    }
};

// TELEFONOS

module.exports = {
    getLugares,
    getLugarConcreto,
    save,
    update,
    patch,
    deleteLugar,
    consultoriosHandler
};
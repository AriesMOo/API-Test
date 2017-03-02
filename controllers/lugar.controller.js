'use strict';

// NOTA: el comportamiento por defecto cuando se pasan parametros que no forman
// parte del schema (POST, PUT) es IGNORARLOS SIN AVISAR. La respuesta puede ser
// 200 - ok y no haber actualizado nada.
const util       = require('util');
const async      = require('async');
const lugarModel = require('../models/lugar.model');
const logger     = require('../config/log4js.config').getLogger('lugarController');

module.exports = {
    getLugares,
    getLugarConcreto,
    save,
    update,
    deleteLugar
};

/* let modelo = centroSaludModel;
function setModeloCorrecto (req) {
  if (req.path === '/consultorios') return centroSaludModel;
  else return consultorioModel;
}*/

function getLugares (req, res) {
  lugarModel.find({})
    .then(lugares => {
      if (lugares.length == 0)
        return res.status(404).send({ message: 'No hay centros de salud' });

      res.status(200).send(lugares);
    })
    .catch(err => res.status(500).send({ err }));
}

/**
 * OJO! Devuelve el lugar sin jsonificar !! no tendra esta forma { lugar: {..} }
 */
function getLugarConcreto (req, res) {
  const lugarID = req.params.lugarID;

  lugarModel.findById(lugarID)
    .then(lugar => (lugar ? res.status(200).send(lugar) : res.status(404).send({ message: 'El ID especificado no correspondea a ningun EAP' })))
    .catch(err => res.status(500).send(err));
}

function save (req, res) {
  let nuevoLugar = new lugarModel(req.body);
  nuevoLugar.audit._actualizdoPorID = req.userID; // Si no viene no hay problema

  nuevoLugar.save()
    .then(lugarGuardado => res.status(200).send({ lugarGuardado }) )
    .catch(err => res.status(500).send({ message: `No se ha podido guardar en la BBDD. ${err}` }) );
}

function update (req, res){
  const lugarID = req.params.lugarID;

 lugarModel.findById(lugarID)
  .then(lugar => {
    if (!lugar) return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });
    if (!lugar.esCentroSalud) return res.status(400).send({ message: 'No puedes asociar un consultorio a otro consultorio' });

    // Se saca la info del bodyrequest (la que se haya enviado)
    for (let key in req.body) {
      lugar[key] = req.body[key];
    }

    lugar.audit._actualizdoPorID = req.userID; // Si no viene no pasa nada

    lugar.save()
      .then(lugarGuardado => res.status(200).send({ lugarGuardado }))
      .catch(err => res.status(500).send({ message: `No se ha podido guardar el registro ya actualizado en la BBDD. ${err}` }));
    })
  .catch(err => res.status(500).send({ message: `No se ha podido actualizar en la BBDD. ${err}` }));
}

function deleteLugar (req, res) {
  const lugarID = req.params.lugarID;
  lugarModel.findById(lugarID)
    .then((lugar) => {
      if (!lugar)
        return res.status(400).send({ message: 'No existe el ID que quires eliminar' });
      if (lugar._redes.length > 0 || lugar._consultorios.length > 0)
        return res.status(400).send({ message: 'No se puede borrar un EAP que contiene redes y/o consultorios ' });

      lugar.remove()
        .then(() => res.status(200).send('EAP borrado'))
        .catch(err => res.status(500).send(err));
      })
    .catch(err => res.status(500).send(err));
}

/* function patch (req, res) {
  logger.debug('Esta pasando HEADERS -> ' + util.inspect(req.headers, false, 20, true));
  logger.debug('Esta pasando BODY -> ' + util.inspect(req.body, false, 20, true));
  res.status(200).send({ message: '#STUB method -> pozi es un patch' });
}*/

// REVISAR: hacer un json update para los arrays (telefonos, redes y consultorios¿?)

// TODO: incluir un handleError para manejar los errores de forma universal
// y ademas poder tener en cuenta si estamos en produccion o no
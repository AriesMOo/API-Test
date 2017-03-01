'use strict';

// NOTA: el comportamiento por defecto cuando se pasan parametros que no forman
// parte del schema (POST, PUT) es IGNORARLOS SIN AVISAR. La respuesta puede ser
// 200 - ok y no haber actualizado nada.
const util       = require('util');
const mongoose   = require('mongoose');
const async      = require('async');
const lugarModel = require('../models/lugar.model');
const logger     = require('../config/log4js.config').getLogger('lugarController');
const dispositivoModel = require('../models/dispositivo.model');

module.exports = {
    getLugares,
    getLugarConcreto,
    save,
    update,
    patch,
    deleteLugar
};

/* let modelo = centroSaludModel;
function setModeloCorrecto (req) {
  if (req.path === '/consultorios') return centroSaludModel;
  else return consultorioModel;
}*/

function consultoriosSonValidos (IDsConsultorios){
  let validos = false;
  logger.debug(`Se llama a la funcion de validacion con consultorios: ${IDsConsultorios}`);

  if (!IDsConsultorios || IDsConsultorios.length <= 0) return false;

  async.each(IDsConsultorios, function iteratee (id, callback) {
    lugarModel.findOne({ '_id':mongoose.Types.ObjectId(id) }, function (err, consult) {
      if (err) return callback(err);
      if (!consult) return callback(`El ID ${id} no corresponde a ningun consultorio`);
      if (consult.esCentroSalud) return callback(`El ID ${id} es un centro de salud (no puedes agregar centros a otros centros como si fueran consultorios)`);

      logger.debug(`Pues existe el ID: ${id}`);
      callback();
    });

  }, function (err){
    if (err){
      logger.error(`Hay algun consultorio malo: ${err}`);
      validos = false;
      return false;
    } else {
      logger.debug('Pues todos los consultorios estan bien formados...');
      validos = true;
      return true;
    }
  });

  return validos;
}
  /* if (IDsConsultorios.length <= 0) return true;
  var pozno = IDsConsultorios.forEach(function (idConsultorio) {
    // if (idConsultorio.isDirectModified() || idConsultorio.isNew)
      var pozi = lugarModel.findOne({ '_id':mongoose.Types.ObjectId(idConsultorio) }, function (err, lugar) {
      // consultorioModel.findById(idConsultorio, function (err, consultorio) {
        if (err) return false;
        if (!lugar) return false;
        if (lugar.esCentroSalud) return false;

        return true;
      });

      logger.debug(`POZI: ${pozi.exec()}`);
      return pozi;
  });

  logger.debug(`POZNO: ${pozno}`);
  return pozno;
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
  let arrayIDsConsultorios = req.body._consultorios;

  // Primero ejecuta (esperando, de forma asincrona) la funcion iteratee
  // Cuando ha terminado (CON TODOS), salta al callback que es la siguiente
  // funcion (cb). Lugar donde ya se mira si existe el lugarID que se pasa
  // y se hace el update 'normal'. Si no hay consultorios no pasa nada porque
  // ejecuta directamnte la funcion callback.
  // Se hace asi por la asincronia. LLevo 7 dias investigando esto, y es la unica
  // forma en la que funciona bien. Es una ejecucion del reves... primero se
  // miran si los consultorios son validos, luego si el lugar sobre el que hay
  // que operar existe (es valido) y por ultimo ya se intenta salvar
  // Se ve que res y req son accesibles globalmente y por eso se puede interrumpir
  // desde donde saa la ejecucion.
  // Si se separan las funciones, se pisan las ejecuciones de res.send() y da error
  async.each(arrayIDsConsultorios, function iteratee (id, callback) {
    lugarModel.findById(id, function (err, consult) {
      if (err) return callback(err);
      if (!consult) return callback(`El ID ${id} no corresponde a ningun consultorio`);
      if (consult.esCentroSalud) return callback(`El ID ${id} es un centro de salud (no puedes agregar centros a otros centros como si fueran consultorios)`);

      callback(); // Es la funcion de mas abajo
    });
  }, function cb (err){
    if (err) res.status(500).send(err);
    else {
      lugarModel.findById(lugarID)
        .then(lugar => {
          if (!lugar) return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });

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
  });
}

function patch (req, res) {
  logger.debug('Esta pasando HEADERS -> ' + util.inspect(req.headers, false, 20, true));
  logger.debug('Esta pasando BODY -> ' + util.inspect(req.body, false, 20, true));
  res.status(200).send({ message: '#STUB method -> pozi es un patch' });
}

function deleteLugar (req, res) {
  res.status(200).send({ message: '#STUB method -> es un delete' });
}

// REVISAR: hacer un json update para los arrays (telefonos, redes y consultorios¿?)

// TODO: incluir un handleError para manejar los errores de forma universal
// y ademas poder tener en cuenta si estamos en produccion o no
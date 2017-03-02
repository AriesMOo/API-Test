'use strict';

const redModel = require('./red.model');
const logger   = require('../../config/log4js.config').getLogger('RED Controller');

module.exports = {
    getRedes,
    getRedConcreta,
    save,
    update,
    borra
};

function getRedes (req, res) {
  redModel.find({})
    .then(redes => {
      if (redes.length == 0)
        return res.status(404).send({ message: 'No existen redes en la BBDD' });

      res.status(200).send(redes);
    })
    .catch(err => res.status(500).send({ err }));
}

/**
 * OJO! Devuelve el modelo sin jsonificar !! no tendra esta forma { modelo: {..} }
 */
function getRedConcreta (req, res) {
  const redID = req.params.redID;

  redModel.findById(redID)
    .then(red => (red ? res.status(200).send(red) : res.status(404).send({ message: 'El ID especificado no correspondea a ninguna RED' })))
    .catch(err => res.status(500).send(err));
}

function save (req, res) {
  let nuevaRed = new redModel(req.body);
  nuevaRed.audit._actualizdoPorID = req.userID; // Si no viene no hay problema

  nuevaRed.save()
    .then(redGuardada => res.status(200).send({ redGuardada }) )
    .catch(err => res.status(500).send({ message: `No se ha podido guardar en la BBDD. ${err}` }) );
}

function update (req, res){
  const redID = req.params.redID;
  /* let arrayIDsConsultorios = req.body._consultorios;

  // Primero ejecuta (esperando, de forma asincrona) la funcion iteratee
  // Cuando ha terminado (CON TODOS), salta al callback que es la siguiente
  // funcion (cb). Lugar donde ya se mira si existe el redID que se pasa
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
      lugarModel.findById(redID)
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
  });*/
}

function borra (req, res) {
  const redID = req.params.redID;
  redModel.findById(redID)
    .then((red) => {
      if (!red)
        return res.status(400).send({ message: 'No existe el ID que quires eliminar' });
      // TODO: comprobar si la red esta asociada a otros lugares o a otros dispositivos... ira con un callback (hell on earth)
      /* if (red.getLugar> 0 || red._consultorios.length > 0)
        return res.status(400).send({ message: 'No se puede borrar un EAP que contiene redes y/o consultorios ' });*/

      red.remove()
        .then(() => res.status(200).send('EAP borrado'))
        .catch(err => res.status(500).send(err));
      })
    .catch(err => res.status(500).send(err));
}
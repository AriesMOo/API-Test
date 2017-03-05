'use strict';

const ipOps            = require('ip');
const mongoose         = require('mongoose');
const lugarModel       = require('../../models/lugar.model');
const dispositivoModel = require('./dispositivo.model');

module.exports = {
    getDispositivos,
    getDispositivoConcreto,
    save,
    update,
    borra,
    testAggregation
};

function getDispositivos (req, res) {
  dispositivoModel.find({}, (err, dispositives) => {
    if (!dispositives || dispositives.length == 0)
      return res.status(404).send({ message: 'No hay dispositivos' });

    res.status(200).send({ dispositives });
  });
}

/**
 * OJO! Devuelve el modelo sin jsonificar !! no tendra esta forma { modelo: {..} }
 */
function getDispositivoConcreto (req, res) {
  const dispositivoID = req.params.dispositivoID;

  dispositivoModel.findById(dispositivoID)
    .then(red => (red ? res.status(200).send(red) : res.status(404).send({ message: 'El ID especificado no correspondea a ningun dispositivo' })))
    .catch(err => res.status(500).send(err));
}

function save (req, res) {
  let nuevoDispositivo = new dispositivoModel(req.body);
  nuevoDispositivo.audit._actualizdoPorID = req.userID; // Si no viene no hay problema

  nuevoDispositivo.save()
    .then(dispositivoGuardado => res.status(200).send({ dispositivoGuardado }) )
    .catch(err => res.status(500).send({ message: `No se ha podido guardar en la BBDD. ${err}` }) );
}

function update (req, res){
  const dispostiivoID = req.params.dispostiivoID;
  dispositivoModel.findById(dispostiivoID)
  .then(dispositivo => {
      if (!dispositivo) return res.status(400).send({ message: 'ID no corresponde a ningun dispositivo' });

      // Se saca la info del bodyrequest (la que se haya enviado)
      for (let key in req.body) {
        dispositivo[key] = req.body[key];
      }
      dispositivo.audit._actualizdoPorID = req.userID; // Si no viene no pasa nada
      dispositivo.save()
        .then(dispositivoGuardado => res.status(200).send({ dispositivoGuardado }))
        .catch(err => res.status(500).send({ message: `No se ha podido guardar el registro ya actualizado en la BBDD. ${err}` }));
    })
  .catch(err => res.status(500).send({ message: `No se ha podido actualizar en la BBDD. ${err}` }));
}

function borra (req, res) {
  const dispostiivoID = req.params.dispostiivoID;

  dispositivoModel.findById(dispostiivoID)
    .then((dispositivo) => {
        if (!dispositivo)
          return res.status(400).send({ message: 'No existe el ID que quires eliminar' });

        dispositivo.remove()
          .then(() => res.status(200).send('Dispositivo borrado'))
          .catch(err => res.status(500).send({ message: `No se ha podido eliminar el dispositivo de la BBDD ${err}` }));
      })
    .catch(err => res.status(500).send(err));
}

function testAggregation (req, res) {
    // Asi busca por networkID y devuelve el objeto completo (con el array de redes). Si hay 3 redes, 3 objetos red devuelve dentro de redes[]
    /* lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId('586e4f070d061f2688a76d82') }, (err, lugar) => {
        res.status(200).send(lugar);
    }); */

    // De esta forma devuelve una sola red en redes -> redes { cidr: ,gateway: ,tipo: ,_id_: } que es la del objeto de busqueda
    // Asi se puede acceder directamente a ella de forma mucho mas comoda (aunque la busqueda es mas chunga)
    const netID = '587140348f9d1bc5e56e0e00'; // '586e4f070d061f2688a76d00';

    lugarModel.find({}, (err, lugares) => {
        console.log(lugares.redes);
    });

    dispositivoModel.aggregate(
        [
            { $unwind:  '$redes' },
            // { $project: { redes: 1 } },
            { $match: { 'redes._id': mongoose.Types.ObjectId(netID) } }
        ])
        .exec(function (err, result) {
            res.status(200).send({ message: result });
        });
}

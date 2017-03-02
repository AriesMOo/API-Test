'use strict';

const redModel         = require('./red.model');

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
    .then(red => {
      red.getDispositivos(function (err, lugar) {
          if (err) {
            console.log(err);
            res.status(500).send(`andios ${err}`);
          } else {
            console.log(`ole yo ! >> ${lugar}`);
            res.status(200).send(`ole yo >> ${lugar}`);
          }
        });
      })
    .catch(err => res.status(500).send(`hay un error ${err}`));

  /* redModel.findById(redID)
    .then(red => (red ? res.status(200).send(red) : res.status(404).send({ message: 'El ID especificado no correspondea a ninguna RED' })))
    .catch(err => res.status(500).send(err));*/
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
  redModel.findById(redID)
  .then(red => {
      if (!red) return res.status(400).send({ message: 'ID no corresponde a ninguna red' });

      // Se saca la info del bodyrequest (la que se haya enviado)
      for (let key in req.body) {
        red[key] = req.body[key];
      }

      red.audit._actualizdoPorID = req.userID; // Si no viene no pasa nada

      red.save()
        .then(redGuardada => res.status(200).send({ redGuardada }))
        .catch(err => res.status(500).send({ message: `No se ha podido guardar el registro ya actualizado en la BBDD. ${err}` }));
    })
  .catch(err => res.status(500).send({ message: `No se ha podido actualizar en la BBDD. ${err}` }));
}

function borra (req, res) {
  const redID = req.params.redID;

  redModel.findById(redID)
    .then((red) => {
        if (!red)
          return res.status(400).send({ message: 'No existe el ID que quires eliminar' });


        // Si la red tiene dispositivos, no se elimina. Si esta asociada a un EAP y no tiene dispositivos, si se podra elimnar (por que no deberia?)
        red.getDispositivos(function (err, dispositivos) {
            if (err) return res.status(500).send(err);
            if (dispositivos) return res.status(404).send({ message: 'No se puede eliminar una red con dispositivos asociados.' });

            console.log('@#@ aqui llego !');
            red.remove()
              .then(() => res.status(200).send('EAP borrado'))
              .catch(err => res.status(500).send(err));
        });
      })
    .catch(err => res.status(500).send(err));
}
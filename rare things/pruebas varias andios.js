  let IPs = this.IPs;

  IPs.forEach((conjuntoIP) => {
    if (conjuntoIP.isDirectModified() || conjuntoIP.isNew)
      // TODO: comprobar que el isDirectModified funciona bien
      // Para cada IP modificada o nueva, se comprueba 1) si el networkID corresponde con una red existente y 2) si la IP esta en el rango de ese networkID
      lugarModel.aggregate(
        [ 
          { $unwind:  '$redes' },
          // { $project: { redes: 1 } },
          { $match: { 'redes._id': mongoose.Types.ObjectId(conjuntoIP.networkID) } }
        ])
        .exec(function (err, lugarPoseedorDeLaRed) {
          if (!lugarPoseedorDeLaRed){
            return next(new Error('No hay ninguna red que conincida con el networkID pasado'));
          }

          // Al haber hecho agregacion, en redes no habra un array, solo habra una NOTE: es un array !! [0]
          const cidrToCheck = lugarPoseedorDeLaRed[0].redes.cidr;
          const ipToCheck = ipOps.fromLong(conjuntoIP.IP);
          if (!ipOps.cidrSubnet(cidrToCheck).contains(ipToCheck)) {
            return next(new Error('La IP está fuera del rango para la red seleccionada'));    
          }
        });
  });

  if (this.isModified())
    this.audit.actualizadoEn = Date.now();

  if (this.isNew){
    this.audit.creadoEn = Date.now();
    // this.audit.actualizadoEn = Date.now(); (este no hace falta pq siempre detectara arriba que esta modificado al ser nuevo)
  }

  next();

================================================
const lugarModel = require('../models/lugar.model');
const ipOps      = require('ip');
const _          = require('lodash');
  
// Debe tener la bandera true pq si no, no funciona bien el next(new Error())
// http://stackoverflow.com/questions/13582862/mongoose-pre-save-async-middleware-not-working-as-expected
dispositivoSchema.pre('save', true, function (next, done) {
  let IPs = this.IPs;

  IPs.forEach((conjuntoIP) => {
    if (conjuntoIP.isDirectModified() || conjuntoIP.isNew)
      // TODO: comprobar que el isDirectModified funciona bien
      // Para cada IP modificada o nueva, se comprueba 1) si el networkID corresponde con una red existente y 2) si la IP esta en el rango de ese networkID
      lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId(conjuntoIP.networkID) }, (err, lugar) => {
        if (!lugar)
          return next(new Error('No hay ninguna red que conincida con el networkID pasado'));
          
        // Porque sigue devolviendo un array con las redes que tenga (si existe alguna red que tenga la IP en el rango correcto)
        const ipToCheck = ipOps.fromLong(conjuntoIP.IP);
        const redToCheck = _.find(lugar.redes, { '_id': conjuntoIP.networkID }); 
        if (!ipOps.cidrSubnet(redToCheck.cidr).contains(ipToCheck))
          return next(new Error('La IP está fuera del rango para la red seleccionada'));
    });
  });

  ==========================

  dispositivoSchema.path('IPs').validate(function (conjuntoIP) {
  // console.log(`this vale originalmente: ${this}`);
  var self = this; 
  var res = true;
  var query = lugarModel.find({ 'redes._id': mongoose.Types.ObjectId(conjuntoIP.networkID) }); /*, function (err, lugar) {
    if (!lugar) {
      console.log('oye que no hay lugares');
      console.log(`this vale: ${this}`);
      console.log(`self vale: ${self}`);
      console.log(`res vale: ${res}`);
      res = false;
      console.log(`res ahora vale: ${res}`);
      return;
    }

    const ipToCheck = ipOps.fromLong(conjuntoIP.IP);
    const redToCheck = _.find(lugar.redes, { '_id': conjuntoIP.networkID }); 
    if (!ipOps.cidrSubnet(redToCheck.cidr).contains(ipToCheck)){
      res = false;
      return;
    }
  })*/
  console.log(`La query es: ${query}`);
  var promise = query.exec();
  console.log(`La proemsa es: ${promise}`);
  promise.then(function (lugar) {
      console.log(this);
      console.log(lugar);
      res = false;
    });

  console.log(`Y el resultado es.. ${res}`);
  return res;
}, 'la validacion de `{PATH}` ha falladdo para `{VALUE}`. No hay ninguna red que conincida con el networkID pasado o la IP esta fuera del rango de la red destino');

/* dispositivoSchema.path('IPs.IP').validate((IP) => {
  lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId(this.networkID) }, (err, lugar) => {
    if (!lugar) 
      return false;
    else {
      // this tiene: _id, IP y networkID
      const redToCheck = _.find(lugar.redes, { '_id': this.networkID }); 
      const ipToCheck = ipOps.fromLong(IP);
      
      if (!ipOps.cidrSubnet(redToCheck.cidr).contains(ipToCheck))
        return false;
    } 
  });
}, 'La IP está fuera del rango para la red seleccionada');*/ 

'use strict';

const mongoose   = require('mongoose');
const lugarModel = require('../models/lugar.model');
const ipOps      = require('ip');

const dispositivoSchema = mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  IPs: [{
    IP: { type: Number, unique: false },
    networkID: { type: mongoose.Schema.Types.ObjectId }
    // TODO: agregar un campo para el lugarID ?? y asi ir a tiro fijo al lugar->red?
  }],
  tipo: { type: String, enum: ['PC', 'Portátil', 'Impresora', 'Equipo de red', 'Servidor', 'Impresora CPC', 'Reservada'] },
  datosTecnicos: {
    fabricante: String,
    modelo: String,
    memoria: String,
    procesador: String,
    // HD: [String]
    HD: String
  },
  ubicacionFisicaEnEAP: String,
  notas: String,
  audit: {
    creadoEn: { type: Date, defaults: Date.now() },
    actualizadoEn: { type: Date, defaults: Date.now() },
    _creadoPorID: mongoose.Schema.Types.ObjectId,
    _actualizadoPorID: mongoose.Schema.Types.ObjectId
  }
});


dispositivoSchema.pre('save', function (next) {
  let IPs = this.IPs;

  IPs.forEach((IP) => {
    if (IP.isDirectModified() || IP.isNew)
      // console.log(`IP modificada: ${IP}`);
      // Para cada IP modificada o nueva, se comprueba 1) si el networkID corresponde con una red existente y 2) si la IP esta en el rango de ese networkID
      lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId(IP.networkID) }, (err, lugar) => {
        if (!lugar)
          return next(new Error('No hay ninguna red que conincida con el networkID pasado'));
          
        console.log(`Lugar findeado: ${lugar}`);
        // Porque sigue devolviendo un array con las redes que tenga (si existe alguna red que tenga la IP en el rango correcto)
        let redAsignadaEsValida = lugar.redes.some((red) => {
          ipOps.cidrSubnet(red.cidr).contains(ipOps.fromLong(IP));
        });

        if (!redAsignadaEsValida){
          console.log('============ IP fuera de rango (la red no coincide con el rango');
          return next(new Error('La IP está fuera del rango para la red seleccionada'));
        }
    }); 
  });

  if (this.isModified())
    this.audit.actualizadoEn = Date.now();

  if (this.isNew){
    this.audit.creadoEn = Date.now();
    this.audit.actualizadoEn = Date.now();
  }

  return next();
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
'use strict';

const mongoose   = require('mongoose');
const lugarModel = require('../models/lugar.model');
const ipOps      = require('ip');
const _          = require('lodash');

const dispositivoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  IPs: [{
    IP: { type: Number, unique: false },
    networkID: { type: mongoose.Schema.Types.ObjectId }
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

// Debe tener la bandera true pq si no, no funciona bien el next(new Error()) (espera a que finalice todo con done) y al final le casca un next()
// http://stackoverflow.com/questions/13582862/mongoose-pre-save-async-middleware-not-working-as-expected
dispositivoSchema.pre('save', true, function (next, done) {
  let IPs = this.IPs;

  IPs.forEach((conjuntoIP) => {
    if (conjuntoIP.isDirectModified() || conjuntoIP.isNew)
      // TODO: comprobar que el isDirectModified funciona bien
      // Para cada IP modificada o nueva, se comprueba 1) si el networkID corresponde con una red existente y 2) si la IP esta en el rango de ese networkID
      lugarModel.findOne({ 'redes._id': mongoose.Types.ObjectId(conjuntoIP.networkID) }, (err, lugar) => {
        if (!lugar)
          return done(new Error('No hay ninguna red que conincida con el networkID pasado'));
          
        // Porque sigue devolviendo un array con las redes que tenga (si existe alguna red que tenga la IP en el rango correcto)
        const ipToCheck = ipOps.fromLong(conjuntoIP.IP);
        const redToCheck = _.find(lugar.redes, { '_id': conjuntoIP.networkID }); 
        if (!ipOps.cidrSubnet(redToCheck.cidr).contains(ipToCheck))
          return done(new Error('La IP está fuera del rango para la red seleccionada'));
        
        done();
    });
  });
  
  if (this.isModified())
    this.audit.actualizadoEn = Date.now();

  if (this.isNew)
    this.audit.creadoEn = Date.now();
    // No hace falta tocar el actualizado. Al crearlo se modifica implcitamente

  next();
});

let dispositivoModel = mongoose.model('Dispositivo', dispositivoSchema);
module.exports = dispositivoModel;

/* TODO: ahora con dispositivoModel se pueden usar metodos estaticos, no?  
    1) getRed() (devuelve una red con agregacion)
    2) getRedes() (devuelve array redes con findOne */

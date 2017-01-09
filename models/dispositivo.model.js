'use strict';

const mongoose = require('mongoose');

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
  // NOTE: aqui estaria bien mirar si la IP cambia o es nueva, si pertenece a una red ya existente
  // pero ciertamente es jarto chungo
  /* let IPs = this.IPs;

  IPs.forEach((IP) => {
    if (IP.isDirectModified())
  });*/

  if (this.isModified())
    this.audit.actualizadoEn = Date.now();

  if (this.isNew){
    this.audit.creadoEn = Date.now();
    this.audit.actualizadoEn = Date.now();
  }

  return next();
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
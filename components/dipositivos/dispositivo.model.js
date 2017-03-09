'use strict';

const mongoose = require('mongoose');
const redModel = require('../redes/red.model');
const ipOps    = require('ip');
const _        = require('lodash');

const dispositivoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  IPs: [{
    IP: { type: String, unique: false },
    _networkID: { type: mongoose.Schema.Types.ObjectId, ref: 'Redes' }
  }],
  tipo: { type: String, required: true, enum: ['PC', 'Portátil', 'Impresora', 'Equipo de red', 'Servidor', 'Impresora CPC', 'Reservada'] },
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
  historico: [{
   IP: String,
   nombre: String,
   fechaModificacion: Date,
   _modificadoPorID: mongoose.Schema.Types.ObjectId
  }],
  audit: {
    _creadoPorID: mongoose.Schema.Types.ObjectId,
    _actualizadoPorID: mongoose.Schema.Types.ObjectId
  }
},{
    timestamps: {
      creadoEn: 'created_at',
      actualizadoEn: 'updated_at'
    }
});

// TODO: hacer un metodo para borrar IPs y nombres (pasarlas a IPs y nombres antiguas) (para mas adelante hoyga)
// TODO: hacer una propiedad lugarID: en el array de IPs (virtual a ver si asi va y si no.. habra que guardarla)

// VALIDACIONES
dispositivoSchema.pre('validate', function (next) {
  // TODO: el nombre deberia coincidir con el cnetro?? avisar solo
  // TODO: asegurarse de que el nombre coincide con el centro al que se asocia la red (y por ende, el equipo)

  // Las validacione son sobre todo (de momento unicamente) para las IPs y las redes-ids
  this.IPs.forEach(function (conjuntoIP) {
    // Test IP: es correcta?
    const regExIP = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
    if (!regExIP.test(conjuntoIP.IP))
      return next(Error(`La IP [${conjuntoIP.IP}] no es valida`));

    // Test red (id): existe? es coherente con la IP?
    if (conjuntoIP.isDirectModified() || conjuntoIP.isNew)
      // TODO: comprobar que el isDirectModified funciona bien
      // Para cada IP modificada o nueva, se comprueba 1) si el networkID corresponde con una red existente y 2) si la IP esta en el rango de ese networkID
      redModel.findById(conjuntoIP._networkID, function (err, red) {
        if (err) return next(err);
        if (!red) return next(Error(`No hay ninguna red que conincida con el networkID asignado a una IP (${conjuntoIP._networkID}) `));
        if (!ipOps.cidrSubnet(red.cidr).contains(conjuntoIP.IP))
          return next(Error(`La IP ${conjuntoIP.IP} está fuera del rango ${red.cidr} para la red seleccionada`));

        // TODO: de paso, validar si la red esta asignada a un centro tb??
      });
  });

  next();
});

// STUFF TODO BEFORE SAVE DATA
dispositivoSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  next();
});

module.exports = mongoose.model('Dispositivos', dispositivoSchema);
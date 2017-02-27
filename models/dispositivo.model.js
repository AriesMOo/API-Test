'use strict';

const mongoose         = require('mongoose');
const centroSaludModel = require('../models/consultorio.model').centroSaludModel;
const ipOps            = require('ip');
const _                = require('lodash');

const dispositivoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  IPs: [{
    IP: { type: Number, unique: false },
    _networkID: { type: mongoose.Schema.Types.ObjectId, ref: 'Redes' }
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
    _creadoPorID: mongoose.Schema.Types.ObjectId,
    _actualizadoPorID: mongoose.Schema.Types.ObjectId
  }
},{
    timestamps: {
      creadoEn: 'created_at',
      actualizadoEn: 'updated_at'
    }
});

// TODO: incorporar un pre('validate') para las validaciones
// TODO: hacer una propiedad lugarID: en el array de IPs (virtual a ver si asi va y si no.. habra que guardarla)
        // Para hacer populates en las consultas (very comodo hoyga)
        // En su defecto tb puede crearse un metodo statico (o 'normal')
        // NOTA: lo mejor es guardar el lugarID dentro de IPs desde el pre('sava')

// Debe tener la bandera true pq si no, no funciona bien el next(new Error()) (espera a que finalice todo con done) y al final le casca un next()
// http://stackoverflow.com/questions/13582862/mongoose-pre-save-async-middleware-not-working-as-expected
dispositivoSchema.pre('save', true, function (next, done) {
  let IPs = this.IPs;

  IPs.forEach((conjuntoIP) => {
    if (conjuntoIP.isDirectModified() || conjuntoIP.isNew)
      // TODO: comprobar que el isDirectModified funciona bien
      // Para cada IP modificada o nueva, se comprueba 1) si el networkID corresponde con una red existente y 2) si la IP esta en el rango de ese networkID
      centroSaludModel.findOne({ 'redes._id': mongoose.Types.ObjectId(conjuntoIP.networkID) }, (err, lugar) => {
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

  next();
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
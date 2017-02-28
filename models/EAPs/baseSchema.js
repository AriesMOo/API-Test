/**
 * Se definen dos esquemas, uno para consultorios y otro para centros de salud.
 * Ambos se definen a partir del baseSchema comun. Los centros de salud anaden
 * un array de IDs de consultorios unicamente.
 */
'use strict';

const mongoose         = require('mongoose');

const EAP_BaseSchema = {
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true, unique: true },
  direccion: {
    via: String,
    numero: Number,
    cp: Number,
    localidad: String,
    notas: String
  },
  telefonos: [{
    nombre: String,
    numero: String,
    notas: String
  }],
  aytoAsociado: String,
  audit: {
    _creadoPorID: mongoose.Schema.Types.ObjectId,
    _actualizadoPorID: mongoose.Schema.Types.ObjectId
  },
  _redes: [{ type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'Redes' }],
};

module.exports = EAP_BaseSchema;
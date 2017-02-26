/**
 * Se definen dos esquemas, uno para consultorios y otro para centros de salud.
 * Los centros de salud heredan de consultorios con los 'discriminators' de
 * mongoose. Los hooks de pre y post tambien se heredan.
 *
 * Va todo a la misma 'tabla' (coleccion en mongo) y se distinguen por el campo
 * discriminador por defecto __t:
 */
'use strict';

const mongoose = require('mongoose');

const consultorioSchema = new mongoose.Schema({
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
},{
  timestamps: {
    creadoEn: 'created_at',
    actualizadoEn: 'updated_at'
  }
});

// VALIDACIONES
consultorioSchema.pre('validate', function (next) {
  // Codigo centros(2) y consultorios(4)
  if (!/^(1703)\d{2}$/.test(this.codigo) && !/^(1703)\d{4}$/.test(this.codigo))
    return next(Error('El codigo debe ser en forma 1703xxxx (donde las "x" son otros numeros)'));

  // Users de audit existen o existieron?
  // Redes existen? - redes no duplicadas

  next();
});

// STUFF TODO BEFORE SAVE DATA
consultorioSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  next();
});

module.exports = mongoose.model('EAPs', consultorioSchema);
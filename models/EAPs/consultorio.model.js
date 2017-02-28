/**
 * Se definen dos esquemas, uno para consultorios y otro para centros de salud.
 * Ambos se definen a partir del baseSchema comun. Los centros de salud anaden
 * un array de IDs de consultorios unicamente.
 */
'use strict';

const mongoose         = require('mongoose');
const baseSchema       = require('./baseSchema');

const consultorioSchema = new mongoose.Schema(baseSchema, {
  timestamps: {
    creadoEn: 'created_at',
    actualizadoEn: 'updated_at'
  }
});

// VALIDACIONES
consultorioSchema.pre('validate', function (next) {
  // Codigo (4 numeros adicionales tras el 1703)
  if (!/^(1703)\d{4}$/.test(this.codigo))
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

module.exports = mongoose.model('Consultorios', consultorioSchema);
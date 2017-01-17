'use strict';

const mongoose = require('mongoose');

const lugarSchema = mongoose.Schema({
    esCentroSalud: { type: Boolean, required: true },
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
    _consultorios: [{ type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'EAPs' }],
},{
    timestamps: {
      creadoEn: 'created_at',
      actualizadoEn: 'updated_at'
    }
});

// VALIDACIONES
lugarSchema.pre('validate', function (next){
  // Codigo
  if (!/^(1703)\d{2}$/.test(this.codigo))
    return next(Error('El codigo debe ser en forma 1703xx (donde las "x" son otros numeros")'));

  // Consultorios (con lugarModel.findById)

  // Users de audit (con UserModel.findById)

  next();
});

// STUFF TODO BEFORE SAVE DATA
lugarSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  next();
});

module.exports = mongoose.model('EAPs', lugarSchema);
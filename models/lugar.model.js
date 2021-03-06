'use strict';

const mongoose = require('mongoose');
const _        = require('lodash');

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

lugarSchema.pre('validate', function (next){
  // Codigo centros(2) y consultorios(4)
  if (this.esCentroSalud && !/^(1703)\d{2}$/.test(this.codigo) )
    return next(Error('El codigo del centro de salud debe ser en forma 1703xx (donde las "x" son otros numeros)'));

  if (!this.esCentroSalud && !/^(1703)\d{4}$/.test(this.codigo))
    return next(Error('El codigo del consultorio debe ser en forma 1703xxxx (donde las "x" son otros numeros'));

  // Consultorios (para otros consultorios) -> array _consultorios ha de estar vacio
  if (this.isModified && !this.esCentroSalud) {
    let consultorios = this._consultorios;
    if (consultorios.length > 0)
      return next(Error('Un consultorio no puede tener asociados otros EAPs'));
  }

  // Consultorios (en centros) con IDs duplicados
  if (this.isModified && this.esCentroSalud){
    let tempArr = _.uniqWith(this._consultorios, _.isEqual);
    if (this._consultorios.length > tempArr.length)
      return next(Error('No se permiten IDs duplicados dentro de _consultorios'));
  }

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
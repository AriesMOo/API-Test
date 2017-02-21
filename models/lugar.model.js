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
  // Codigo centros(2) y consultorios(4)
  if (!/^(1703)\d{2}$/.test(this.codigo) && !/^(1703)\d{4}$/.test(this.codigo))
    return next(Error('El codigo debe ser en forma 1703xxxx (donde las "x" son otros numeros")'));

  // Consultorios (con lugarModel.findById)
  if (this.isModified){
    let consultorios = this._consultorios;
    let i = 0;
    for (i; i < consultorios.length; i++) {
      let j = 0;
      let contadorApariciones = 0;

      // TODO: aqui irán las validaciones sobre si existen los IDs suministrados, y si eademas estos IDs son consultorios (y no centros)
      // TODO: recordar tb que un consultorio no puede contener otros consultorios

      for (j; j < consultorios.length; j++) {
        if (consultorios[i] === consultorios[j])
          contadorApariciones++;
      }

      console.log('Hasta aqui llego...' + this);

      if (contadorApariciones > 1)
        return next(Error('ERROR: El codigo del consultorio esta duplicado'));
    }
  }

  // Users de audit (con UserModel.findById)

  // EAPs con la bandera de consultorios a false tiene que tener vacio el array de consultorios

  next();
});

// STUFF TODO BEFORE SAVE DATA
lugarSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  next();
});

module.exports = mongoose.model('EAPs', lugarSchema);
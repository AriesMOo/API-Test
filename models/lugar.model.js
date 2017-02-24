'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');

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
async function consultorioValidoParaMeter (consultorio, modelo){
  try {
    const q = await lugarModel.findById(consultorio, (err, eap) => {
      if (err) return false;
      if (!eap) console.log('####### no existe !!');
    });

    console.log(`aqui va una q: ${q}`);
    if (!q) {
      console.log('INVALIDADO');
      modelo.invalidate('_consultorios', 'No  hay ningun EAP con la Id pasada');
      return false;
    } else {
      console.log('existe consultorio');
      return true;
    }

  } catch (err) {
    console.error(`ha habido un ERROR !! ${err}`);
    return false;
  }
}

lugarSchema.pre('validate', function (next){
  // Codigo centros(2) y consultorios(4)
  if (!/^(1703)\d{2}$/.test(this.codigo) && !/^(1703)\d{4}$/.test(this.codigo))
    return next(Error('El codigo debe ser en forma 1703xxxx (donde las "x" son otros numeros)'));

  // Consultorios (para centros de salud)
  var consultoriosValidos = true;
  if (this.isModified && this.esCentroSalud){
    var self = this;
    let consultorios = this._consultorios;
    let i = 0;
    console.log(`-> ${this.nombre} -- consultorios: ${this._consultorios}`);
    for (i; i < consultorios.length; i++) {
      /* lugarModel.findById(consultorios[i])
        .then(eap => {
          if (!eap){
            console.log('####### no existe !!');
            return next(Error('No existe el Id del consultorio en la BBDD'));
          }
          if (eap.esCentroSalud)
            return next(Error('El EAP que se trata de introducir no es un consultorio'));
        })
        .catch(err => {
          console.log('###### hay un error');
          return next(Error(`Problemas en la consulta a la BBDD (${err})`))
        });*/
      /* let queEsEsto = lugarModel.findById(consultorios[i], function (err, eap) {
        if (err) return next(Error(`Problemas en la consulta a la BBDD (${err})`));
        if (!eap){
            console.log(`####### no existe !! y self vale > ${self}`);
            self.invalidate('_consultorios', 'No  hay ningun EAP con la Id pasada');
            consultoriosValidos = false;
            return next(new Error('No existe el Id del consultorio en la BBDD'));
          }
      });
      console.log(queEsEsto);*/
      consultorioValidoParaMeter(consultorios[i], this);
    }
  }

  if (!consultoriosValidos){
    console.log('#-#-#- INVALIDANDO QUE ES GERUNDIO');
    this.invalidate('_consultorios', 'No  hay ningun EAP con la Id pasada');
  }

  // Consultorios (para otros consultorios) -> array _consultorios ha de estar vacio
  if (this.isModified && !this.esCentroSalud) {
    let consultorios = this._consultorios;
    if (consultorios.length > 0)
      return next(new Error('Un consultorio no puede tener asociados otros EAPs'));
  }

  // Users de audit (con UserModel.findById)

  // EAPs con la bandera de consultorios a false tiene que tener vacio el array de consultorios

  next();
});

// STUFF TODO BEFORE SAVE DATA
lugarSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  // Garantiza que no haya duplicados en los ids de los consultorios porque el unique no va bien
  if (this.isModified && this.esCentroSalud)
    this._consultorios = _.uniqWith(this._consultorios, _.isEqual);

  next();
});

const lugarModel = mongoose.model('EAPs', lugarSchema);
module.exports = lugarModel;
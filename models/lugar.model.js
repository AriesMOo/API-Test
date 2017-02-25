'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
import async from 'async';

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

lugarSchema.statics.consultorioValido = function (idConsultorio, fnCb) {
  this.find({ '_id':mongoose.Types.ObjectId(idConsultorio) }, fnCb);
};

// VALIDACIONES
lugarSchema.pre('validate', true, function (next, done) {
  // Codigo centros(2) y consultorios(4)
  if (!/^(1703)\d{2}$/.test(this.codigo) && !/^(1703)\d{4}$/.test(this.codigo))
    return done(Error('El codigo debe ser en forma 1703xxxx (donde las "x" son otros numeros)'));
  else done();

  // Consultorios (para centros de salud)
  /* var self = this;
  async.every(this._consultorios, function (idConsultorio, callback) {
    lugarModel.find({ '_id':mongoose.Types.ObjectId(idConsultorio) }, function (err, eap) {
      if (err) return callback(err, true);
      if (eap.length == 0) return callback('no existe', true);

      console.log(eap);

      callback(null, !err);
    });
  }, function (err, result) { // Si todos lo passan sera true, si no, false
      console.log(`resultado: ${result}`);
      if (!result || err){
        console.log('####### problemas');
        console.log(self);
        self.invalidate('_consultorios', 'No  hay ningun EAP con la Id pasada');
        return next(Error('no mola'));
      }
  });*/


  this._consultorios.forEach((idConsultorio) => {
    // if (idConsultorio.isDirectModified() || idConsultorio.isNew)
      lugarModel.findOne({ '_id':mongoose.Types.ObjectId(idConsultorio) }, (err, eap) => {
      // lugarModel.findById(idConsultorio, (err, eap) => {
        if (err) return done(err);
        if (!eap) return done(Error('No hay consultorios con esa ID'));
        if (eap.length == 0) return done(Error('No hay consultorios con esa ID'));
        if (eap.esCentroSalud) return done(Error('No puedes poner un centro de salud como un consultorio'));

        console.log(eap);

        done();
      });
  });

  /* var consultoriosValidos = true;
  if (this.isModified && this.esCentroSalud){
    var self = this;
    let consultorios = this._consultorios;
    let i = 0;
    console.log(`-> ${this.nombre} -- consultorios: ${this._consultorios}`);
    for (i; i < consultorios.length; i++) {
      lugarModel.findById(consultorios[i])
        .then(eap => {
          if (!eap){
            console.log('####### no existe !!');
            self.invalidate('_consultorios', 'No  hay ningun EAP con la Id pasada');
            return done(Error('No existe el Id del consultorio en la BBDD'));
          }
          if (eap.esCentroSalud)
            return done(Error('El EAP que se trata de introducir no es un consultorio'));
        })
        .catch(err => {
          console.log('###### hay un error');
          return done(Error(`Problemas en la consulta a la BBDD (${err})`));
        });
    }

    // done();
  }

  if (!consultoriosValidos){
    console.log('#-#-#- INVALIDANDO QUE ES GERUNDIO');
    this.invalidate('_consultorios', 'No  hay ningun EAP con la Id pasada');
    return done(Error('No existe el cons'));
  }*/

  // Consultorios (para otros consultorios) -> array _consultorios ha de estar vacio
  if (this.isModified && !this.esCentroSalud) {
    let consultorios = this._consultorios;
    if (consultorios.length > 0)
      return done(new Error('Un consultorio no puede tener asociados otros EAPs'));

    done();
  }


  // Users de audit (con UserModel.findById)

  // EAPs con la bandera de consultorios a false tiene que tener vacio el array de consultorios
  // done();
  next();
});

// STUFF TODO BEFORE SAVE DATA
lugarSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  // Garantiza que no haya duplicados en los ids de los consultorios porque el unique no va bien
  if (this.isModified && this.esCentroSalud)
    this._consultorios = _.uniqWith(this._consultorios, _.isEqual);

  /* this._consultorios.forEach((idConsultorio) => {
    // if (idConsultorio.isDirectModified() || idConsultorio.isNew)
      this.model('EAPs').find({ '_id':mongoose.Types.ObjectId(idConsultorio) }, function (err, eap) {
        if (err) return next(err);
        if (!eap) return next(new Error('No hay consultorios con esa ID'));
        if (eap.esCentroSalud) return next(new Error('No puedes poner un centro de salud como un consultorio'));

        console.log(eap);
      });
  });*/

  next();
});

let lugarModel = mongoose.model('EAPs', lugarSchema);
module.exports = lugarModel;
/**
 * Se definen dos esquemas, uno para consultorios y otro para centros de salud.
 * Ambos se definen a partir del baseSchema comun. Los centros de salud anaden
 * un array de IDs de consultorios unicamente.
 */
'use strict';

const mongoose         = require('mongoose');
const _                = require('lodash');
const baseSchema       = require('./baseSchema');
const consultorioModel = require('./consultorio.model');

// Primero copiamos el esquema base en un nuevo objeto, y le anadimos el campo _consultorios
let schemaBuilder = {};
Object.assign(schemaBuilder, baseSchema);
// schemaBuilder._consultorios = [{ type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'Consultorios' }];
schemaBuilder._consultorios = [{ type: String }];

// Ahora ya se crea el mongoose-Schema con los campos timestamps adicionales
const centroSaludSchema = new mongoose.Schema(schemaBuilder, {
  timestamps: {
    creadoEn: 'created_at',
    actualizadoEn: 'updated_at'
  }
});

/* centroSaludSchema.statics.consultorioValido = function (idConsultorio, fnCb) {
  this.find({ '_id':mongoose.Types.ObjectId(idConsultorio) }, fnCb);
};*/

// ** VALIDACIONES (en paralelo)
centroSaludSchema.pre('save', true, function (next, done) {
  // Check consultorios validos
  if (this._consultorios.length > 0)
    this._consultorios.forEach(function (idConsultorio) {
      // if (idConsultorio.isDirectModified() || idConsultorio.isNew)
        consultorioModel.findOne({ '_id':mongoose.Types.ObjectId(idConsultorio) }, function (err, consultorio) {
        // consultorioModel.findById(idConsultorio, function (err, consultorio) {
          if (err) return done(err);
          if (!consultorio) {
            console.log(`No existe el consultorio con ID: ${idConsultorio}`);
            return done(Error(`No hay consultorios con ID ${idConsultorio}`));
          }

          // console.log(`Por lo visto existe el consultorio ${consultorio}`);

          done();
        });
    });
  else
    done();

  next();
});

// ** VALIDACIONES (en serie)
centroSaludSchema.pre('validate', function (next) {
  // Codigo
  if (!/^(1703)\d{2}$/.test(this.codigo))
    return next(Error('El codigo debe ser en forma 1703xx (donde las "x" son otros numeros)'));

  next();
});

// ** STUFF TODO BEFORE SAVE DATA
centroSaludSchema.pre('save', function (next) {
  if (this.isDirectModified('nombre' || this.nombre.isNew ))
    this.nombre = this.nombre.toLowerCase();

  // Garantiza que no haya duplicados en los ids de los consultorios porque el unique no va bien
  if (this.isModified)
    this._consultorios = _.uniqWith(this._consultorios, _.isEqual);

  next();
});

module.exports = mongoose.model('centros-salud', centroSaludSchema);

/* centroSaludSchema.pre('validate', true, function (next, done) {
  // Consultorios
  if (this._consultorios.length > 0)
    this._consultorios.forEach(function (idConsultorio) {
      // if (idConsultorio.isDirectModified() || idConsultorio.isNew)
        // consultorioModel.findOne({ '_id':mongoose.Types.ObjectId(idConsultorio) }, (err, eap) => {
        dispositivoModel.findById(idConsultorio, function (err, consultorio) {
          if (err) return done(err);
          if (!consultorio) {
            console.log('#NO EXISTE !!');
            return done(Error(`No hay consultorios la ID ${idConsultorio}`));
          }

          done();
        });
    });
  else
    done();

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
  }

  next();
});

// STUFF TODO BEFORE SAVE DATA
centroSaludSchema.pre('save', function (next) {
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
  });

  next();
});*/
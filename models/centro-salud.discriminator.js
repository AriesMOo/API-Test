/**
 * Se definen dos esquemas, uno para consultorios y otro para centros de salud.
 * Los centros de salud heredan de consultorios con los 'discriminators' de
 * mongoose. Los hooks de pre y post tambien se heredan.
 *
 * Va todo a la misma 'tabla' (coleccion en mongo) y se distinguen por el campo
 * discriminador por defecto __t:
 */
'use strict';

const mongoose         = require('mongoose');
const _                = require('lodash');
const consultorioModel = require('./consultorio.model');
const dispositivoModel = require('./dispositivo.model');

const centroSaludSchema = new mongoose.Schema({
  _consultorios: [{ type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'EAPs' }]
});

/* centroSaludSchema.statics.consultorioValido = function (idConsultorio, fnCb) {
  this.find({ '_id':mongoose.Types.ObjectId(idConsultorio) }, fnCb);
};*/

// VALIDACIONES
centroSaludSchema.pre('validate', true, function (next, done) {
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
  }*/

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
  });*/

  next();
});

module.exports = consultorioModel.discriminator('centro-salud', centroSaludSchema);
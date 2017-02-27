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
const extend   = require('mongoose-schema-extend');
const dispositivoModel = require('./dispositivo.model');

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

/* ************************** CENTROS DE SALUD ****************************** */
/* ************************************************************************** */
const centroSaludSchema = consultorioSchema.extend({
  _consultorios: [{ type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'consultorios' }]
});

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

  next();
});

centroSaludSchema.pre('save', function (next) {
  // Garantiza que no haya duplicados en los ids de los consultorios porque el unique no va bien
  if (this.isModified && this.esCentroSalud)
    this._consultorios = _.uniqWith(this._consultorios, _.isEqual);

  next();
});


// Exportamos lo necesario
let consultorioModel = mongoose.model('consultorios', consultorioSchema);
let centroSaludModel = mongoose.model('centros-salud', centroSaludSchema);

module.exports = {
  consultorioModel,
  centroSaludModel
};
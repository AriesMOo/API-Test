'use strict';

const mongoose = require('mongoose');

const redSchema = new mongoose.Schema({ 
  cidr: { type: String, unique: true, required: true },
  gateway: { type: Number, required: true },
  tipo: { type: String, required: true, enum: ['Centro', 'Medora', 'Veterinarios/Farmas', 'Consultorios', 'Rango viejo'] },
  notas: String,
  audit: {
    creadoEn: { type: Date, defaults: Date.now() },
    actualizadoEn: { type: Date, defaults: Date.now() },
    _creadoPorID: mongoose.Schema.Types.ObjectId,
    _actualizadoPorID: mongoose.Schema.Types.ObjectId
  }
});

// TODO: comprobar con RegEx que se cumplen algunos Strings (IE: IPS, CIDR, etc)
const lugarSchema = mongoose.Schema({
    esCentroSalud: { type: Boolean, required: true },
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    direccion: {
      via: String,
      numero: String,
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
    redes: [redSchema],
    _consultorios: [mongoose.Schema.Types.ObjectId],
    audit: {
      creadoEn: { type: Date, defaults: Date.now() },
      actualizadoEn: { type: Date, defaults: Date.now() },
      _creadoPorID: mongoose.Schema.Types.ObjectId,
      _actualizadoPorID: mongoose.Schema.Types.ObjectId
    }
});

/* NO se puede aplicar esto porque las redes son un lio para actualizar campos 
de _actualizadoPOrID y demas (al ser una array, hay que buscar el actualizad)
Requiere menos trabajo hacerlo a "mano" desde el front-end/angular*/

lugarSchema.pre('save', function (next) {
  if (this.isDirectModified('redes')) {
    // TODO: comprobar si esto funciona en el update
    this.redes.forEach()
      // Iterar sobre las redes para ver cual es la que cambia (directModified)
    console.log('aqui se ha cambiado algo');
  }

  if (this.isModified())
    this.audit.actualizadoEn = Date.now();
  
  if (this.isNew)
    this.audit.creadoEn = Date.now();
  
  next();
});

module.exports = mongoose.model('EAPs', lugarSchema);
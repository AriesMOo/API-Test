'use strict';

const mongoose = require('mongoose');
const ipOps    = require('ip');

const redSchema = new mongoose.Schema({ 
  cidr: { type: String, required: true/* , unique: true */ }, // Da problemas al guardar centros sin redes ()
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

const lugarSchema = mongoose.Schema({
    esCentroSalud: { type: Boolean, required: true },
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
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
    redes: [redSchema],
    _consultorios: [{ type: mongoose.Schema.Types.ObjectId, unique: true }],
    audit: {
      creadoEn: { type: Date },
      actualizadoEn: { type: Date },
      _creadoPorID: mongoose.Schema.Types.ObjectId,
      _actualizadoPorID: mongoose.Schema.Types.ObjectId
    }
});

// VALIDACIONES
lugarSchema.pre('validate', function (next){
  // Codigo
  if (!/^(1703)\d{2}$/.test(this.codigo))
    return next(Error('El codigo debe ser en forma 1703xx (donde las "x" son otros numeros")'));
  
  // CIDR de las redes
  const regExCIDR = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  for (let i = 0; i < this.redes.length; i++) {
    let cidr = this.redes[i].cidr;
    
    console.log(`gateway comprobados: ${cidr}`);
    if (!regExCIDR.test(cidr))
      return next(Error(`El cidr ${cidr} no tiene un formato valido`));
  }

  // Gateway de las redes -> BUG: no se puede hacer pq es un NUMBER. Esto hay que revisarlo en el cliente/controlador TODO:
  // OJO: de esta forma falla a veces (con 10.36.29/9 de CIDR y 10.36.29.999 de GW)
  for (let i = 0; i < this.redes.length; i++) {
    let ipGw = ipOps.fromLong(this.redes[i].gateway);
    if (!ipOps.cidrSubnet(this.redes[i].cidr).contains(ipGw)) 
      return next(Error(`El gateway ${ipGw} no pertenece al rango del CIDR o no tiene un formato válido`));
  }

  // Consultorios (con lugarMOdel.findById) TODO:

  // Users de audit del lugar y de las redes (con userModel.findById)

  next();
});

// STUFF TODO BEFORE SAVE DATA
lugarSchema.pre('save', function (next) {
  if (this.isDirectModified('redes')) {
    // FIXME:  esta parte no va y encima resta una hora la parte de abajo que si chuta
    this.redes.forEach((red) => {
      if (red.isNew)
        red.audit.creadoEn = Date.now();
      if (red.isModified()) {
        console.log(`Detecta actualizacion de alguna red  ${Date.now()}`);
        red.audit.actualizadoEn = Date.now();
      }
    });
  }

  if (this.isModified()) {
    console.log(`Detecta actualizacion general  ${ Date.now() }`);
    this.audit.actualizadoEn = Date.now();
  }
  
  if (this.isNew)
    this.audit.creadoEn = Date.now();
  
  next();
});

module.exports = mongoose.model('EAPs', lugarSchema);
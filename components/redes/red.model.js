'use strict';

const mongoose = require('mongoose');
const ipOps    = require('ip');

const redSchema = new mongoose.Schema({
  cidr: { type: String, required: true, unique: true }, // Da problemas al guardar centros sin redes ()
  gateway: { type: String, required: true },
  tipo: { type: String, required: true, enum: ['centro', 'medora', 'veterinarios/farmas', 'consultorios', 'rango viejo'] },
  notas: String,
  audit: {
    _creadoPorID: mongoose.Schema.Types.ObjectId,
    _actualizadoPorID: mongoose.Schema.Types.ObjectId
  }
},{
  timestamps: {
    creadoEn: 'created_at',
    actualizadoEn: 'updated_at'
  }
});

// Metodos de instancia
redSchema.methods.getLugar = function (cb) {
  return this.model('EAPs').find({ _redes: this._id }, cb);
};

redSchema.methods.getDispositivos = function (cb) {
  // FIXME: evidentemente esto no funciona... xD
  return this.model('Dispositivos').find({ IPs: { $elemMatch: { _networkID: this._id } } }, cb);
};

// VALIDACIONES
redSchema.pre('validate', function (next){
  // CIDR
  const regExCIDR = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  if (!regExCIDR.test(this.cidr))
    return next(Error(`El cidr ${this.cidr} no tiene un formato valido`));

  // Gateway
  /* let ipGw = ipOps.fromLong(this.gateway);
  if (!ipOps.cidrSubnet(this.cidr).contains(ipGw))
      return next(Error(`El gateway ${ipGw} no pertenece al rango del CIDR o no tiene un formato válido`));*/

  // Viene del frontend, asi que no estara convertida a Long
  const regExIP = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
  if (!regExIP.test(this.gateway))
    return next(Error(`El gateway ${this.gateway} no es una IP valida`) );
  if (!ipOps.cidrSubnet(this.cidr).contains(this.gateway))
    return next(Error(`El gateway ${this.gateway} no pertenece al rango del CIDR o no tiene un formato válido`));

  next();
});

redSchema.pre('save', function (next) {
  let gw = ipOps.toLong(this.gateway);
  this.gateway = gw;

  next();
});

module.exports = mongoose.model('Redes', redSchema);
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
  return this.model('Dispositivos').find({ IPs: { $elemMatch: { _networkID: this._id } } }, cb);
};

redSchema.method('borraSeguro', function (cb) {
 let self = this;

 this.model('EAPs').find({ _redes: this._id }, function (err, arrLugares) {
    if (err) return cb(err, null);
    if (!arrLugares || arrLugares.length == 0) {
      // Si no hay ningun EAP que contenga esta red, se borra la red y fuera
      self.remove()
        .then(() => { return cb(null, 'EAP borrado'); })
        .catch(err => cb(err) );
    } else {
      // Si esta aqui es porque hay un EAP que tiene la red. Hay que sacar su id del array _redes y ya despues eliminar la red
      if (arrLugares > 1)
        return cb(new Error('Hay mas de un EAP con la red que se pretende eliminar asignada. Resuelva el conflicto primero (deje la red en un solo EAP)', null));

      let eap = arrLugares[0];
      let arrSinRedAeliminar = [];
      for (let i = 0; i < eap._redes.length; i++){
        if (eap._redes[i].toString() != self._id.toString() )
          arrSinRedAeliminar.push(eap._redes[i]);
      }
      eap._redes = arrSinRedAeliminar;

      // Se guarda el EAP sin la red a borrar, y solo si este se guarda, se procede a eliminar la red en si misma
      eap.save(function (err, arrLugares){
        if (err) return cb(err);
        if (!arrLugares) return cb(new Error('Ha habido errores actualizando el EAP al que pertenecia esta red. No se borra nada'), null);

        // Una vez borrada la red del EAP, ya se puede eliminar esta con seguridad
        self.remove()
          .then(() => { return cb(null, 'EAP borrado'); })
          .catch(err => cb(err) );
      });
    }
  });
});

// Le pasamos una IP y nos devuelve la red en la que esta (si esta en mas de una, error??)
redSchema.static('getRed', function (ip, cb) {
  // NOTA: Esto no va porque no no pilla la fn ipOps dentro de Mongo..
  /* let coincidenciasFn = function () {
    return (ipOps.cidrSubnet(this.cidr).contains(ip));
  }; *
  return this.find({ $where: coincidenciasFn }, cb);*/

  // Primero se comprueba si el parametro pasado es una IP valida
  // TODO: hacer un helper (action helper, model helper o lo que sea) con las constantes para las IPs y el CIDR (que se usa en mas sitios, IE: dispositivo.model)
  const regExIP = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
  if (!regExIP.test(ip))
    return cb(Error(`Lo que se pretende buscar no parece una ip valida [${ip}]`), null);

  // Si la ip esta bien formada, se buscan todas las redes
  this.find({}, function (err, redes) {
    if (err) return cb(err, null);

    if (!redes || redes.length < 1)
      return cb(err, redes);
    else {
      let contadorRedesEncontradas = 0;
      let resultado = null;

      // Se recorren las redes hasta encontrar una que en la que pueda estar y se almacenan resultados intermedios para luego analizar y/o devolver los datos
      redes.forEach(function (red) {
        if (ipOps.cidrSubnet(red.cidr).contains(ip)) {
          contadorRedesEncontradas++;
          resultado = red;
        }
      });

      if (contadorRedesEncontradas > 0)
        if (contadorRedesEncontradas > 1)
          return (cb(Error('INCONSISTENCIA GRAVE EN LA APP. Existe mas de una red que contiene la IP buscada'), null));
        else
          return cb(null, resultado);
      else
        return cb(null, resultado);
    }
  });
});

// VALIDACIONES
redSchema.pre('validate', function (next){
  // CIDR
  const regExCIDR = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  if (!regExCIDR.test(this.cidr))
    return next(Error(`El cidr ${this.cidr} no tiene un formato valido`));

  // Gateway
  const regExIP = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
  if (!regExIP.test(this.gateway) && !regExIP.test(ipOps.fromLong(this.gateway)) )
    return next(Error(`El gateway ${this.gateway} no es una IP valida`) );
  if (!ipOps.cidrSubnet(this.cidr).contains(this.gateway) &&
        !ipOps.cidrSubnet(this.cidr).contains(ipOps.fromLong(this.gateway)) )
    return next(Error(`El gateway ${this.gateway} no pertenece al rango del CIDR o no tiene un formato válido`));

  // TODO: si el CIDR cambia verificar que los dispositivos asociados a esta red siguen siendo validos
  // TODO: antes de proceder a salvar la red comprobar que su id esta asociado a algun EAP (this.getLugar())

  next();
});

redSchema.pre('save', function (next) {
  let gw = ipOps.toLong(this.gateway);
  this.gateway = gw;

  next();
});

module.exports = mongoose.model('Redes', redSchema);
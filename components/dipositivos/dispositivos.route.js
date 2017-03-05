'use strict';

const router  = require('express').Router();
const dispositivoCtrl = require('./dispositivo.controller');

router.route('/dispositivos')
  .get(dispositivoCtrl.getDispositivos)
  .post(dispositivoCtrl.save);

router.route('/dispositivos/:dispositivoID')
  .get(dispositivoCtrl.getDispositivoConcreto)
  .put(dispositivoCtrl.update)
  .delete(dispositivoCtrl.borra);

module.exports = router;
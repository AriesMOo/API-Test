'use strict';

const router  = require('express').Router();
const redCtrl = require('./red.controller');

router.route('/redes')
  .get(redCtrl.getRedes)
  .post(redCtrl.save);

router.route('/redes/:redID')
  .get(redCtrl.getRedConcreta)
  .put(redCtrl.update)
  .delete(redCtrl.borra);

module.exports = router;
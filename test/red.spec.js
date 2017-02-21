'use strict'

const chai       = require('chai');
const chaiHttp   = require('chai-http');
const logger     = require('../config/log4js.config').getLogger('redSpec');
const redModel   = require('../models/red.model');
const fixtures   = require('./fixtures');
const expect     = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] Unit tests for the API model: RED', function () {
	before('Remove all data from EAPs collection', function (done){
		redModel.remove({}, done);
	});

  describe('1) Tests basicos contra la BBDD', function (){
  });

  describe('2) Tests basados en cliente HTTP', function (){
		describe('> Prueba de rutas basicas', function (){
    });

    describe('> CRUD basico /api/eaps', function (){
      it('No se puede duplicar el CIDR de una red');
      it('No deberia poderse crear una red que solape el rango de otra');
      it('No se puede eliminar una red con dispositivos asociados');
      it('Los campos audit de una red CREADA son correctos');
      it('Los campos audit de una red MODIFICADA son correctos');
    });
  });
});
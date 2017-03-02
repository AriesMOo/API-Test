'use strict';

const chai       = require('chai');
const chaiHttp   = require('chai-http');
const logger     = require('../config/log4js.config').getLogger('redSpec');
const redModel   = require('../components/redes/red.model');
const fixtures   = require('./fixtures');
const expect     = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] TEST RED MODEL solo HTTP:', function () {
  let idRedArmunia;
  let idRedTemporal;

  before('Remove all data from EAPs collection', function (done){
		redModel.remove({}, done);
	});

  // PRUEBAS BASE------------------------------------------------------------
  describe('>>CRUD basico /api/redes >', function (){
    let redTemp = {
      cidr: '10.36.29.0/26',
      gateway: '10.36.29.1',
      tipo: 'medora'
    };

    it('Se puede crear una red simple', function (done) {
      chai.request(server)
        .post('/redes')
        .send(fixtures.redArmunia)
        .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('redGuardada');
            expect(res.body.redGuardada.cidr).equals(fixtures.redArmunia.cidr);
            expect(res.body.redGuardada).to.contain.all.keys(Object.keys(fixtures.redArmunia));

            idRedArmunia = res.body.redGuardada._id;

            done();
          })
        .catch(err => done(Error(err.response.text)) );
    });

    it('Se puede crear una segunda red aleatoria', function (done) {
      chai.request(server)
        .post('/redes')
        .send(redTemp)
        .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('redGuardada');
            expect(res.body.redGuardada.cidr).equals(redTemp.cidr);
            expect(res.body.redGuardada).to.contain.all.keys(Object.keys(redTemp));

            idRedTemporal = res.body.redGuardada._id;

            done();
          })
        .catch(err => done(Error(err.response.text)) );
    });

    it('No se puede duplicar el CIDR de una red');
    it('No deberia poderse crear una red que solape el rango de otra');
    it('No se puede eliminar una red con dispositivos asociados');
    it('Los campos audit de una red CREADA son correctos');
    it('Los campos audit de una red MODIFICADA son correctos');
    it('Puede traerse el lugar al que esta asociada la red directametne (metodo de instancai)');
    it('Puede traerse los dispositivos de la red directamente (metodo de instancia)');
    it('Se puede borrar la red aleatoria creada antes', function (done) {
      chai.request(server)
        .del(`/redes/${idRedTemporal}`)
        .then(function (res) {
            res.should.have.status(200);

            done();
          })
        .catch(err => done(Error(err)) );
    });
  });

  // RUTAS GENERICAS---------------------------------------------------------
  describe('>>Prueba de rutas basicas >', function (){
    it('Puede hacer un GET /api/redes', function (done){
      chai.request(server)
        .get('/redes')
        .end((err, res) => {
          expect(err).not.exist;
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body[0]).to.contains.all.keys(['_id', 'cidr', 'gateway', 'tipo']);

          done();
        });
    });

    it('Puede hacer un GET en /api/redes:ideap para conseguir info de un solo EAP', function (done){
      chai.request(server)
        .get(`/redes/${idRedArmunia}`)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('cidr').equal(fixtures.redArmunia.cidr);

          done();
        });
    });

    it('Un GET a /api/redes:idred con una id que no existe devuelve un stus 404', function (done){
      chai.request(server)
        .get('/redes/58ac1ba4ed9a564598399bed')
        .end((err) => {
          expect(err).to.have.status(404);

          done();
        });
    });
  });
});
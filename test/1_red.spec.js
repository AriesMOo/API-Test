'use strict';

const chai       = require('chai');
const chaiHttp   = require('chai-http');
const logger     = require('../config/log4js.config').getLogger('redSpec');
const redModel   = require('../components/redes/red.model');
const lugarModel = require('../models/lugar.model');
const fixtures   = require('./fixtures');
const expect     = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] TEST RED MODEL solo HTTP:', function () {
  let idRedArmunia;
  let idRedTemporal;
  let idArmunia;
  let redTemp = {
    cidr: '192.168.1.0/26',
    gateway: '192.168.1.1',
    tipo: 'medora',
    notas: 'pozi'
  };

  before('Remove all data from EAPs collection', function (done){
		redModel.remove({}).exec();
    lugarModel.remove().exec();

    done();
	});

  // PRUEBAS BASE------------------------------------------------------------
  describe('>>CRUD basico /api/redes >', function (){
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

    it('Se puede crear un centro nuevo con una red ya incluida [TEMPORAL] (ojo se eliminara despues si se ejecuta solo "mocha"' , function (done) {
      // A partir de los datos de 'fixture' se construye el nuevo centro (ya con una red)
      let armuniaMod = {};
      Object.assign(armuniaMod, fixtures.armunia);
      armuniaMod._redes = [idRedArmunia];

      // Primero se crea Armunia (luego se eliminara si se ejecuta solo "mocha")
      chai.request(server)
        .post('/eaps')
        .send(armuniaMod)
        .then(res => {
            expect(res).have.status(200);
            expect(res.body).to.be.an('Object');
            expect(res.body.lugarGuardado).to.have.property('codigo').equal(armuniaMod.codigo);
            expect(res.body.lugarGuardado._redes[0]).equal(idRedArmunia);
            expect(res.body.lugarGuardado._redes.length).equal(1);

            idArmunia = res.body.lugarGuardado._id;

            done();
          })
        .catch(err => done(new Error(err.response.text)) );
    });

    it('Se puede borrar una red estando asignada a un EAP y esta desaparece tambien del EAP', function (done) {
      // Se envia la peticion HTTP
      chai.request(server)
        .del(`/redes/${idRedArmunia}`)
        .then(function (res) {
            expect(res).to.have.status(200);

            // Busca en la BBDD por el modelo y revisa si se ha borrado tambien de el.
            lugarModel.findById(idArmunia)
              .then(function (lugar) {
                  expect(lugar).to.exist;
                  expect(lugar._redes.length).equal(0);

                  done();
                })
              .catch(err => done(Error(err)) );

          })
        .catch(err => done(Error(err)) );
    });

    it('Se puede cambiar el CIDR de una red guardada y sigue siendo coherente con el GW');
    it('Se puede cambiar el CIDR de una red guardada y es imposible que solape con otras');
    it('No se puede cambiar el CIDR de una red si deja las IPs de los dispositivos fuera del rango');
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
        .catch(err => done(Error(`Uy.. lio ${err.response.text}`)) );
    });

    it('Se crea de nuevo la red aleatoria, para que quede constancia y hacer mas tests', function (done) {
      chai.request(server)
        .post('/redes')
        .send(redTemp)
        .then(res => {
            expect(res).to.have.status(200);
            expect(res.body.redGuardada).to.contain.all.keys(Object.keys(redTemp));
            idRedTemporal = res.body.redGuardada._id;
            done();
          })
        .catch(err => done(Error(err.response.text)) );
    });

    it('Se puede moficar las notas de una red y no se rompe nada (CIDR y GW siguen validando pese a ser String/Long)', function (done) {
      chai.request(server)
        .get(`/redes/${idRedTemporal}`)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res).to.have.status(200);

          let redTempModificada = res.body;
          redTempModificada.notas = 'Modifico esto y fuego !';

          chai.request(server)
            .put(`/redes/${idRedTemporal}`)
            .send(redTempModificada)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.redGuardada).to.have.property('notas').equals(redTempModificada.notas);

                done();
              })
            .catch(err => done(Error(err.response.text)) );
        });
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
        .get(`/redes/${idRedTemporal}`)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('cidr').equal(redTemp.cidr);

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
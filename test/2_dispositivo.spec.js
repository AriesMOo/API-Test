'use strcit';

const ObjectId         = require('mongoose').Types.ObjectId;
const chai             = require('chai');
const chaiHttp         = require('chai-http');
const lugarModel       = require('../models/lugar.model');
const redModel         = require('../components/redes/red.model');
const dispositivoModel = require('../components/dipositivos/dispositivo.model');
const fixtures         = require('./fixtures');
const should           = chai.should;
const expect           = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] TEST DISPOSITIVO MODEL:', function () {
  let idMiEquipo;

  before('Remove all data from Dispositivos collection', function (done){
		dispositivoModel.remove({}).exec();
    redModel.remove({}).exec();
    lugarModel.remove().exec();

    done();
	});

  // PRUEBAS BASE------------------------------------------------------------
  describe('>>Base test con dispositivos (/api/dispositivos):', function (){
    let idRedTemp;
    let miEquipo = {
      nombre: 'GAPLE1810SSIN0103',
      tipo: 'PC'
    };

    it('Se puede crear un dispositivo basado en mi propio equipo', function (done) {
      chai.request(server)
        .post('/dispositivos')
        .send(miEquipo)
        .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('dispositivoGuardado');
            expect(res.body.dispositivoGuardado.nombre).equals(miEquipo.nombre.toLowerCase());
            expect(res.body.dispositivoGuardado).to.contain.all.keys(Object.keys(miEquipo));

            idMiEquipo = res.body.dispositivoGuardado._id;

            done();
          })
        .catch(err => done(Error(err.response.text)) );
    });

    it('Se puede eliminar el anterior dispositivo', function (done) {
      chai.request(server)
        .del(`/dispositivos/${idMiEquipo}`)
        .then(function (res) {
            expect(res).to.have.status(200);

            // Busca en la BBDD por el modelo y revisa si se efectivamente se ha borrado
            dispositivoModel.findById(idMiEquipo, function (err, disp) {
              expect(err).to.not.exist;
              expect(disp).to.not.exist;

              done();
            });
          })
        .catch(err => done(Error(err)) );
    });

    it('Se puede crear una red e insertar mi equipo en ella', function (done) {
      let redTemp = {
        cidr: '10.36.29.0/24',
        gateway: '10.36.29.1',
        tipo: 'centro',
        notas: 'Es una red de prueba creada desde 2_dispositivo.spec.js'
      };

      // Se crea la red
      chai.request(server)
        .post('/redes')
        .send(redTemp)
        .then(res => {
            expect(res).to.have.status(200);
            idRedTemp = res.body.redGuardada._id;

            miEquipo.IPs = {
              IP: '10.36.29.49',
              _networkID: idRedTemp
            };

            // Se crea un nuevo equipo
            chai.request(server)
              .post('/dispositivos')
              .send(miEquipo)
              .then(function (res) {
                  expect(res).have.status(200);
                  expect(res.body).to.be.an('object');
                  expect(res.body).to.have.property('dispositivoGuardado');
                  expect(res.body.dispositivoGuardado).have.property('nombre').equal(miEquipo.nombre.toLowerCase());
                  expect(res.body.dispositivoGuardado).have.property('tipo').equal(miEquipo.tipo);
                  expect(res.body.dispositivoGuardado).to.have.property('IPs');
                  expect(res.body.dispositivoGuardado.IPs.length).to.be.equal(1);

                  idMiEquipo = res.body.dispositivoGuardado._id;

                  done();
                })
              .catch(err => console.error(err) );
          })
        .catch(err => done(Error(err.response.text)) );
    });

    it('Se puede actualizar el dispositivo anterior', function (done) {
      chai.request(server)
        .get(`/dispositivos/${idMiEquipo}`)
        .then( function (res) {
            expect(res).have.status(200);
            expect(res.body).have.property('nombre').equal(miEquipo.nombre.toLowerCase());


            let dispActualizado = res.body;
            dispActualizado.nombre = 'pozipozno';

            chai.request(server)
              .put(`/dispositivos/${idMiEquipo}`)
              .send(dispActualizado)
              .then(function (res) {
                  expect(res).have.status(200);
                  expect(res.body.dispositivoGuardado).have.property('nombre').equal('pozipozno');

                  done();
                })
              .catch(err => { console.log(err); done(err); });
          })
        .catch(err => { console.error(err); done(Error(err.response.text)); });
    });

    it('Se puede actualizar el dispositivo anterior con una nueva IP (creando una nueva red ad-hoc)');
    it('Se puede borrar IPs y no pasa nada');
    it('Un dispositivo puede no tener IPs y no se rompe nada');
  });

  // RUTAS GENERICAS---------------------------------------------------------
  describe('>>Rutas genericas:', function (){
    it('Puede hacer un GET /api/dispositivos', function (done){
      chai.request(server)
        .get('/dispositivos')
        .end((err, res) => {
          expect(err).not.exist;
          res.should.have.status(200);
          res.body.should.be.an('array');
          // expect(res.body[0]).to.have.all.keys(['_id', 'esCentroSalud']); // Esto obliga a que no hay ni mas ni menos que las especificadas
          expect(res.body[0]).to.contains.all.keys(['_id', 'nombre', 'tipo', 'historico', 'IPs']);

          done();
        });
    });

    it('Puede hacer un GET en /dispositivos:iddisp para conseguir info de un solo EAP', function (done){
      chai.request(server)
        .get(`/dispositivos/${idMiEquipo}`)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('nombre');

          done();
        });
    });

    it('Un GET a /api/dispositivos:iddispositivo con una id que no existe devuelve un stus 404', function (done){
      chai.request(server)
        .get('/dispositivos/58ac1ba4ed9a564598399bed')
        .end((err) => {
          expect(err).to.have.status(404);

          done();
        });
    });
  });
});
'use strcit';

const ObjectId         = require('mongoose').Types.ObjectId;
const chai             = require('chai');
const chaiHttp         = require('chai-http');
const lugarModel       = require('../models/lugar.model');
const dispositivoModel = require('../components/dipositivos/dispositivo.model');
const fixtures         = require('./fixtures');
const should           = chai.should;
const expect           = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] TEST DISPOSITIVO MODEL:', function () {

  before('Remove all data from Dispositivos collection', function (done){
		dispositivoModel.remove({}).exec();
    lugarModel.remove().exec();

    done();
	});

  // PRUEBAS BASE------------------------------------------------------------
  describe('>>Base test con dispositivos (/api/dispositivos):', function (){
    let idMiEquipo;
    let idRedTemp;
    let miEquipo = {
      nombre: 'GAPLE1810SSIN0103',
      tipo: 'PC',
      /* IPs: {
        IP: '10.36.29.49',
        _networkID: ''
      }*/
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

    it('Se puede eliminar el anterior dispositivo');

    it('Se puede crear una red e insertar mi equipo en ella', function (done) {
      let redTemp = {
        cidr: '10.36.29.0/24',
        gateway: '10.36.29.1',
        tipo: 'centro',
        notas: 'Es una red de prueba creada desde 2_dispositivo.spec.js'
      };

      chai.request(server)
        .post('/redes')
        .send(redTemp)
        .then(res => {
            expect(res).to.have.status(200);
            idRedTemp = res.body.redGuardada._id;

            // TODO: crear 1º el equip sin la red. Crear un test que lo actualice con la red esta y fuera. [o borrar el disps y volverlo a crear actualizado !!] O crear primero la red. Una de dos !
            /* chai.request(server)
              .post()*/
            done();
          })
        .catch(err => done(Error(err.response.text)) );
    });

    it('Se puede actualizar el dispositivo anterior');
    // TODO: comprobar si red.getDispositivos() funcionan bien !! ;)
  });

  // RUTAS GENERICAS---------------------------------------------------------
  describe('>>Rutas genericas:', function (){
    /* it('Puede hacer un GET /api/eaps', function (done){
      chai.request(server)
        .get('/eaps')
        .end((err, res) => {
          expect(err).not.exist;
          res.should.have.status(200);
          res.body.should.be.an('array');
          // expect(res.body[0]).to.have.all.keys(['_id', 'esCentroSalud']); // Esto obliga a que no hay ni mas ni menos que las especificadas
          expect(res.body[0]).to.contains.all.keys(['_id', 'esCentroSalud']);

          done();
        });
    });

    it('Puede hacer un GET en /api/eaps:ideap para conseguir info de un solo EAP', function (done){
      chai.request(server)
        .get(`/eaps/${armuniaID}`)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('codigo').equal(fixtures.armunia.codigo);

          done();
        });
    });

    it('Un GET a /api/eaps:ideap con una id que no existe devuelve un stus 404', function (done){
      chai.request(server)
        .get('/eaps/58ac1ba4ed9a564598399bed')
        .end((err) => {
          expect(err).to.have.status(404);

          done();
        });
    });*/
  });
});
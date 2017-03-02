'use strict';

const chai       = require('chai');
const chaiHttp   = require('chai-http');
const logger     = require('../config/log4js.config').getLogger('redSpec');
const redModel   = require('../components/redes/red.model');
const fixtures   = require('./fixtures');
const expect     = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] TEST RED MODEL:', function () {
	before('Remove all data from EAPs collection', function (done){
		redModel.remove({}, done);
	});

  /** ********************************************************************* **/
  describe('A) Directo a BBDD', function (){
  });

  /** ********************************************************************* **/
  describe('B) Cliente HTTP', function (){

    // PRUEBAS BASE------------------------------------------------------------
    describe('>>CRUD basico /api/redes', function (){
      it('No se puede duplicar el CIDR de una red');
      it('No deberia poderse crear una red que solape el rango de otra');
      it('No se puede eliminar una red con dispositivos asociados');
      it('Los campos audit de una red CREADA son correctos');
      it('Los campos audit de una red MODIFICADA son correctos');

      it('Puede traerse el lugar al que esta asociada la red directametne (metodo de instancai)');
      it('Puede traerse los dispositivos de la red directamente (metodo de instancia)');
    });

    // RUTAS GENERICAS---------------------------------------------------------
    describe('>>Prueba de rutas basicas', function (){
      /* it('Puede hacer un GET /api/redes', function (done){
				chai.request(server)
					.get('/redes')
					.end((err, res) => {
						expect(err).not.exist;
						res.should.have.status(200);
						res.body.should.be.an('array');
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
      });*/

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
});
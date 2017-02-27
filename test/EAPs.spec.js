'use strcit';

const ObjectId         = require('mongoose').Types.ObjectId;
const chai             = require('chai');
const chaiHttp         = require('chai-http');
const centroSaludModel = require('../models/centro-salud.discriminator');
const consultorioModel = require('../models/consultorio.model');
const fixtures         = require('./fixtures');
const should           = chai.should;
const expect           = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] Unit tests for the API model: LUGAR', function () {
	let IDarmuniaMetidoDesdeBBDD;

  before('Remove all data from EAPs collection', function (done){
		// centroSalud.remove({}, done); este no parece funcionar.. tiene sentido pq ahora hereda de consultorio qu es el que establece el modelo
    consultorioModel.remove({}, done);
	});

  /** ********************************************************************* **/
	describe('1) Tests basicos contra la BBDD', function (){
		let armunia = {
			codigo: '170398',
			nombre: 'Armunia - directo a BBDD',
		};

		it('Se puede salvar un centro con datos basicos (Armunia - 170301 - esCentroSalud)', function (done) {
			new centroSaludModel(armunia).save(function (err, lugarGuardado) {
				if (err) return done(err);

				lugarGuardado.should.be.a('object');
				lugarGuardado.should.have.property('_id');
				expect(lugarGuardado.nombre).to.be.equal(armunia.nombre.toLowerCase());
				expect(lugarGuardado.codigo).to.be.equal(armunia.codigo);

        IDarmuniaMetidoDesdeBBDD = lugarGuardado._id;

				done();
			});
		});

		it('Se puede salvar otro centro (aleatorio)', function (done) {
			new centroSaludModel({
				codigo: '170399',
				nombre: 'Otra movida',
			}).save(function (err, lugarGuardado){
				if (err) return done(err);

				expect(err).to.not.exist;
				expect(lugarGuardado).exist;
				done();
			});
		});

		it('No se pueden salvar centros con condigo identico (aleatorio)', function (done) {
			new centroSaludModel({
				codigo: '170398',
				nombre: 'Otra movida',
			}).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro con codigo erroneo (solo numeros)', function (done) {
			new centroSaludModel({
				codigo: '170300000',
				nombre: 'Armunia',
			}).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro con codigo erroneo (ascii)', function (done) {
			new centroSaludModel({
				codigo: 'memola el jamon',
				nombre: 'Armunia',
			}).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro sin datos basicos (requeridos)', function (done) {
			new centroSaludModel({ codigo: '170305' }).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro con datos que no aparecen en el schema', function (done) {
			new centroSaludModel({ poyas: 'muchas' }).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro sin algun datos obligatorio', function (done) {
			new centroSaludModel({ codigo: '170399' }).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

	});

  /** ********************************************************************* **/
	describe('2) Tests basados en cliente HTTP', function (){
    let armuniaID;
    let cembranosID;
    let grullerosID;

    // PRUEBAS BASE------------------------------------------------------------
    describe('> Pruebas base con centros en /api/centros-salud', function (){
			it('Crea un centro completo (sin referencias a consultorios o redes) basado en Armunia', function (done){
				chai.request(server)
					.post('/centros-salud')
					.send(fixtures.armunia)
          .then(res => {
						expect(res).have.status(200);
						expect(res.body).to.be.a('object');
						expect(res.body).have.property('lugarGuardado');
						expect(res.body.lugarGuardado).have.property('codigo').equal(fixtures.armunia.codigo);
            expect(res.body.lugarGuardado.telefonos.length).equal(2);

						let keysPasadas = Object.keys(fixtures.armunia);
						let keysAdicionales = ['_id', '__v', '__t', 'createdAt', 'updatedAt', '_consultorios', '_redes'];
						let keys = keysPasadas.concat(keysAdicionales);
						expect(res.body.lugarGuardado).to.have.all.keys(keys);

						armuniaID = res.body.lugarGuardado._id;

						done();
					})
          .catch(err => done(new Error(err.response.text)) );
			});

      it('No se puede actualizar sin enviar datos (datos vacios)', function (done){
        chai.request(server)
          .put(`/centros-salud/${armuniaID}`)
          .send( {} )
          .then(res => {
            expect(res).have.status(200);
            const tamanoRespuesta = Object.keys(res.body.lugarGuardado).length;
            const tamanoArmunia = Object.keys(fixtures.armunia).length;
            expect(tamanoRespuesta).to.be.at.least(tamanoArmunia);

            done();
          })
          .catch(err => done(Error(err.response.text)) );
      });

      it('Se puede actualizar el centro anterior', function (done){
        let armuniaModificado = {};
        Object.assign(armuniaModificado, fixtures.armunia);
        armuniaModificado.nombre = 'Armunia updateado';

        chai.request(server)
          .put(`/centros-salud/${armuniaID}`)
          .send(armuniaModificado)
          .then(res => {
            expect(res).have.status(200);
            expect(res.body.lugarGuardado.nombre).equal(armuniaModificado.nombre.toLowerCase());
            expect(res.body.lugarGuardado.length).equal(armuniaModificado.length);

            done();
          })
          .catch(err => done(Error(err.response.text)) );
      });

      it('Si se intentan actualizar campos que no existen, no se rompe nada', function (done){
        centroSaludModel.findById(armuniaID)
          .then(lugar => {
            // Modifico el centro
            lugar.pito = 'Pozi poz no';

            // Pruebo la peticion HTTP
            chai.request(server)
              .put(`/centros-salud/${armuniaID}`)
              .send(lugar)
              .then(res => {
                expect(res).have.status(200);
                expect(res.body.lugarGuardado.pito).not.exist;
                expect(res.body.lugarGuardado.length).equal(fixtures.armunia.length);

                done();
              })
              .catch(err => done(new Error(err.response.text)) );
          })
          .catch(err => done(new Error(`ArmuniaID no parece existir -> ${err}`)));
      });

      it('No se puede duplicar el codigo de un centro al salvarlo');
      it('No se puede duplicar el nombre de un centro al salvarlo');
      it('Se pueden actualizar los telefonos');
      it('Se pueden borrar los telefonos');
			it('Los datos de audit (fecha y users) son correctos');
    });

    // CONSULTORIOS------------------------------------------------------------
    describe('> Pruebas directamente a BBDD', function (){
      it('Se puede crear un consultorio sin mas', function (done) {
        let test = {
          codigo: '170340',
          nombre: 'esto ye un test !',
        };

        let consTest = new consultorioModel(test);
        consTest.save(function (err, lugarGuardado) {
          if (err) done(err);

          lugarGuardado.should.be.a('object');
          lugarGuardado.should.have.property('_id');
          expect(lugarGuardado.nombre).to.be.equal(test.nombre.toLowerCase());
          expect(lugarGuardado.codigo).to.be.equal(test.codigo);

          IDarmuniaMetidoDesdeBBDD = lugarGuardado._id;

          done();
        });
      });
    });

    describe('> Pruebas con CONSULTORIOS /api/eaps', function (){
      it('Se pude anadir un consultorio simple (CEMBRANOS)', function (done){
        chai.request(server)
					.post('/consultorios')
					.send(fixtures.cembranos)
          .then(res => {
						expect(res).have.status(200);
						expect(res.body).to.be.a('object');
						expect(res.body).have.property('lugarGuardado');
						expect(res.body.lugarGuardado).have.property('codigo').equal(fixtures.cembranos.codigo);

            let keysPasadas = Object.keys(fixtures.cembranos);
						let keysAdicionales = ['_id', '__v', 'createdAt', 'updatedAt', '_redes', 'telefonos'];
						let keys = keysPasadas.concat(keysAdicionales);
            expect(res.body.lugarGuardado).to.have.all.keys(keys);

						cembranosID = res.body.lugarGuardado._id;

						done();
					})
          .catch(err => done(new Error(err.response.text)));
      });

      it('Se puede anadir el consultorio(Cembranos) al centro creado anteriormente (ARMUNIA)', function (done){
        // Se solicita al server el objeto actual (armnia)
        chai.request(server)
          .get(`/centros-salud/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let armuniaNuevo = res.body;
            armuniaNuevo._consultorios.push(cembranosID);

            // Se sube al server y se guarda el resultado para posteriores pruebas (negativas)
            chai.request(server)
              .put(`/centros-salud/${armuniaID}`)
              .send(armuniaNuevo)
              .then(res => {
                expect(res).have.status(200);
                expect(res.body.lugarGuardado).to.have.property('codigo').equal(fixtures.armunia.codigo);
                expect(res.body.lugarGuardado._consultorios[0]).equal(cembranosID);

                done();
              })
              .catch(err => done(new Error(err.response.text)) );
              });
      });

      it('No se pueden agregar IDs duplicados al campo _consultorios:', function (done){
        chai.request(server)
          .get(`/centros-salud/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let nuevoArmunia = res.body;
            nuevoArmunia._consultorios.push(cembranosID);

            chai.request(server)
              .put(`/centros-salud/${armuniaID}`)
              .send(nuevoArmunia)
              .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.lugarGuardado._consultorios.length).to.be.equal(1);

                done();
              })
              .catch(err => done(new Error(err.response.text)) );
          });
      });

      it('No se pueden agregar ids que no existen a _consultorios', function (done){
        chai.request(server)
          .get(`/centros-salud/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let nuevoArmunia = res.body;
            nuevoArmunia._consultorios.push(ObjectId.createFromHexString('000000010000000000000000'));

            chai.request(server)
              .put(`/centros-salud/${armuniaID}`)
              .send(nuevoArmunia)
              .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.lugarGuardado._consultorios.length).to.be.equal(1);

                done();
              })
              .catch(err => done(new Error(err.response.text)) );
          });
      });

      /* it('No se pueden agregar consultorios cuyo id es un centro a _consultorios', function (done){
        chai.request(server)
          .get(`/eaps/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let nuevoArmunia = res.body;
            nuevoArmunia._consultorios.push(IDarmuniaMetidoDesdeBBDD);

            chai.request(server)
              .put(`/eaps/${armuniaID}`)
              .send(nuevoArmunia)
              .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.lugarGuardado._consultorios.length).to.be.equal(1);

                done();
              })
              .catch(err => done(new Error(err.message)) );
          });
      });*/

      /* it('Se puede anadir un segundo consultorio (GRULLEROS)', function (done) {
        chai.request(server)
					.post('/eaps')
					.send(fixtures.grulleros)
          .then(res => {
						expect(res).have.status(200);
						expect(res.body).to.be.a('object');
						expect(res.body).have.property('lugarGuardado');
						expect(res.body.lugarGuardado).have.property('codigo').equal(fixtures.grulleros.codigo);

            let keysPasadas = Object.keys(fixtures.grulleros);
						let keysAdicionales = ['_id', '__v', 'createdAt', 'updatedAt', '_consultorios', '_redes', 'telefonos'];
						let keys = keysPasadas.concat(keysAdicionales);
            expect(res.body.lugarGuardado).to.have.all.keys(keys);

            grullerosID = res.body.lugarGuardado._id;
            done();
          })
          .catch(err => done(new Error(err.message)) );
      });

      it('Se puede anadir GRULLEROS a ARMUNIA', function (done){
        // Ahora tratamos de incluir el consultorio en Armunia
        chai.request(server)
          .get(`/eaps/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let nuevoArmunia = res.body;
            nuevoArmunia._consultorios.push(grullerosID);
            chai.request(server)
              .put(`/eaps/${armuniaID}`)
              .send(nuevoArmunia)
              .then(res => {
                expect(res).have.status(200);
                expect(res.body.lugarGuardado).to.have.property('codigo').equal(fixtures.armunia.codigo);
                expect(res.body.lugarGuardado._consultorios.length).to.be.equal(2);
                expect(res.body.lugarGuardado._consultorios[0]).equal(cembranosID);
                expect(res.body.lugarGuardado._consultorios[1]).equal(grullerosID);

                done();
              })
              .catch(err => done(Error(err.message)) );
          });
      });

      it('No se pueden agregar consultorios a un consultorio');
      it('Si se manda algo que no es un array al campo _consultorios: no se rompe nada');
      it('Se puede eliminar un consultorio de un centro de salud');
    });

    // REDES-------------------------------------------------------------------
    describe('> Pruebas con REDES en /api/centros-salud', function (){
      it('Se puede insertar un centro con redes ya predefinidas');
      it('Se puede crear un centro con redes y consultorios (COMPLETO) basado en Eras');
      it('Se puede anadir una red a un centro de salud');
      it('Se puede eliminar la red del centro de salud');
      it('No se puede eliminar un centro de salud con redes y/o consultorios asociados');
      it('No se puede eliminar un consultorio con redes asociados');
		});

    // RUTAS GENERICAS---------------------------------------------------------
    describe('> Prueba de rutas genericas', function (){
			it('Puede hacer un GET /api/centros-salud', function (done){
				chai.request(server)
					.get('/centros-salud')
					.end((err, res) => {
						expect(err).not.exist;
						res.should.have.status(200);
						res.body.should.be.an('array');
						// expect(res.body[0]).to.have.all.keys(['_id', 'esCentroSalud']); // Esto obliga a que no hay ni mas ni menos que las especificadas
						expect(res.body[0]).to.contains.all.keys(['_id', 'esCentroSalud']);

						done();
					});
			});

      it('Puede hacer un GET en /api/centros-salud:ideap para conseguir info de un solo EAP', function (done){
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

      it('Un GET a /api/centros-salud:ideap con una id que no existe devuelve un stus 404', function (done){
        chai.request(server)
          .get('/centros-salud/58ac1ba4ed9a564598399bed')
          .end((err) => {
            expect(err).to.have.status(404);

            done();
          });
      });*/
		});
	});
});
'use strcit';

// Resto de utilidades
const chai       = require('chai');
const chaiHttp   = require('chai-http');
const lugarModel = require('../models/lugar.model');
const fixtures   = require('./fixtures');
const should     = chai.should;
const expect     = chai.expect;

const server = 'http://localhost:3000/api';
chai.use(chaiHttp);

describe('[X] Unit tests for the API model: LUGAR', function () {
	let IDarmuniaMetidoDesdeBBDD;

  before('Remove all data from EAPs collection', function (done){
		lugarModel.remove({}, done);
	});

  /** ********************************************************************* **/
	describe('1) Tests basicos contra la BBDD', function (){
		let armunia = {
			esCentroSalud: true,
			codigo: '170398',
			nombre: 'Armunia - directo a BBDD',
		};

		it('Se puede salvar un centro con datos basicos (Armunia - 170301 - esCentroSalud)', function (done) {
			new lugarModel(armunia).save(function (err, lugarGuardado) {
				if (err) return done(err);

				lugarGuardado.should.be.a('object');
				lugarGuardado.should.have.property('_id');
				expect(lugarGuardado.nombre).to.be.equal(armunia.nombre.toLowerCase());
				expect(lugarGuardado.codigo).to.be.equal(armunia.codigo);
				expect(lugarGuardado.esCentroSalud).to.be.equal(armunia.esCentroSalud);

        IDarmuniaMetidoDesdeBBDD = lugarGuardado._id;

				done();
			});
		});

		it('Se puede salvar otro centro (aleatorio)', function (done) {
			new lugarModel({
				esCentroSalud: false,
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
			new lugarModel({
				esCentroSalud: false,
				codigo: '170398',
				nombre: 'Otra movida',
			}).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro con codigo erroneo (solo numeros)', function (done) {
			new lugarModel({
				esCentroSalud: true,
				codigo: '170300000',
				nombre: 'Armunia',
			}).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro con codigo erroneo (ascii)', function (done) {
			new lugarModel({
				esCentroSalud: true,
				codigo: 'memola el jamon',
				nombre: 'Armunia',
			}).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro sin datos basicos (requeridos)', function (done) {
			new lugarModel({ codigo: '170305' }).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro con datos que no aparecen en el schema', function (done) {
			new lugarModel({ poyas: 'muchas' }).save(function (err, lugarGuardado){
				expect(err).to.exist;
				expect(lugarGuardado).to.not.exist;
				done();
			});
		});

		it('No se puede guardar un centro sin algun datos obligatorio', function (done) {
			new lugarModel({ codigo: '170399' }).save(function (err, lugarGuardado){
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
    describe('> Pruebas base con centros en /api/eaps', function (){
			it('Crea un centro completo (sin referencias a consultorios o redes) basado en Armunia', function (done){
				chai.request(server)
					.post('/eaps')
					.send(fixtures.armunia)
          .then(res => {
						expect(res).have.status(200);
						expect(res.body).to.be.a('object');
						expect(res.body).have.property('lugarGuardado');
						expect(res.body.lugarGuardado).have.property('codigo').equal(fixtures.armunia.codigo);
            expect(res.body.lugarGuardado.telefonos.length).equal(2);

						let keysPasadas = Object.keys(fixtures.armunia);
						let keysAdicionales = ['_id', '__v', 'createdAt', 'updatedAt', '_consultorios', '_redes'];
						let keys = keysPasadas.concat(keysAdicionales);
						expect(res.body.lugarGuardado).to.have.all.keys(keys);

						armuniaID = res.body.lugarGuardado._id;

						done();
					})
          .catch(err => {
            return done(new Error(err.response.text));
          });
			});

      it('No se puede actualizar sin enviar datos (datos vacios)', function (done){
        chai.request(server)
          .put(`/eaps/${armuniaID}`)
          .send( {} )
          .then(res => {
            expect(res).have.status(200);
            const tamanoRespuesta = Object.keys(res.body.lugarGuardado).length;
            const tamanoArmunia = Object.keys(fixtures.armunia).length;
            expect(tamanoRespuesta).to.be.at.least(tamanoArmunia);

            done();
          })
          .catch(err => {
            return done(err); // done(new Error(err.response.text));
          });
      });

      it('Se puede actualizar el centro anterior', function (done){
        let armuniaModificado = {};
        Object.assign(armuniaModificado, fixtures.armunia);
        armuniaModificado.nombre = 'Armunia updateado';

        chai.request(server)
          .put(`/eaps/${armuniaID}`)
          .send(armuniaModificado)
          .then(res => {
            expect(res).have.status(200);
            expect(res.body.lugarGuardado.nombre).equal(armuniaModificado.nombre.toLowerCase());
            expect(res.body.lugarGuardado.length).equal(armuniaModificado.length);

            done();
          })
          .catch(err => {
            return done(new Error(err.response.text));
          });
      });

      it('Si se intentan actualizar campos que no existen, no se rompe nada', function (done){
        lugarModel.findById(armuniaID)
          .then(lugar => {
            // Modifico el centro
            lugar.pito = 'Pozi poz no';

            // Pruebo la peticion HTTP
            chai.request(server)
              .put(`/eaps/${armuniaID}`)
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
    describe('> Pruebas con CONSULTORIOS /api/eaps', function (){
      it('Se pude anadir un consultorio simple (CEMBRANOS)', function (done){
        chai.request(server)
					.post('/eaps')
					.send(fixtures.cembranos)
          .then(res => {
						expect(res).have.status(200);
						expect(res.body).to.be.a('object');
						expect(res.body).have.property('lugarGuardado');
						expect(res.body.lugarGuardado).have.property('codigo').equal(fixtures.cembranos.codigo);

            let keysPasadas = Object.keys(fixtures.cembranos);
						let keysAdicionales = ['_id', '__v', 'createdAt', 'updatedAt', '_consultorios', '_redes', 'telefonos'];
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
          .get(`/eaps/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let armuniaNuevo = res.body;
            armuniaNuevo._consultorios.push(cembranosID);

            // Se sube al server y se guarda el resultado para posteriores pruebas (negativas)
            chai.request(server)
              .put(`/eaps/${armuniaID}`)
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
          .get(`/eaps/${armuniaID}`)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.have.status(200);

            let nuevoArmunia = res.body;
            nuevoArmunia._consultorios.push(cembranosID);

            chai.request(server)
              .put(`/eaps/${armuniaID}`)
              .send(nuevoArmunia)
              .then(res => expect(res).to.have.status(500) ) // aqui no debería llegar, pero por si acaso no lo hace bien (y devuelve un 200)
              .catch(err => {
                // console.log(res);
                console.log(err);
                expect(err).to.have.status(500);

                done();
              });
          });
      });

      /* it('No se pueden agregar ids que no existen a _consultorios', function (done){
        armuniaConConsultorios._consultorios.push('58ac44cinventado44297bbe'); // Se usa el valor conseguido anteriormente del server, para no volverlo a pedir

        chai.request(server)
          .put(`/eaps/${armuniaID}`)
          .send(armuniaConConsultorios)
          .then(res => { expect(res.status).to.have.status(500); }) // aqui no debería llegar..
          .catch(err => {
            expect(err).to.have.status(500);

            // console.log(armuniaConConsultorios);
            armuniaConConsultorios._consultorios.pop();

            done();
          });
      });*/

      /* it('No se pueden agregar consultorios cuyo id es un centro a _consultorios', function (done){
        armuniaConConsultorios._consultorios.push(IDarmuniaMetidoDesdeBBDD); // Se usa el valor conseguido anteriormente del server, para no volverlo a pedir

        chai.request(server)
          .put(`/eaps/${armuniaID}`)
          .send(armuniaConConsultorios)
          .then(res => { expect(res.status).to.have.status(500); }) // aqui no debería llegar..
          .catch(err => {
            expect(err).to.have.status(500);

            // console.log(armuniaConConsultorios);
            armuniaConConsultorios._consultorios.pop();

            done();
          });
      });*/

      it('Se puede anadir un segundo consultorio (GRULLEROS)', function (done) {
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
          .catch(err => done(new Error(err.response.text)) );
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
              .catch(err => {
                console.log(err);
                done(new Error(err.response.text));
              });
          });
      });

      it('No se pueden agregar consultorios a un consultorio');
      it('Si se manda algo que no es un array al campo _consultorios: no se rompe nada');
      it('Se puede eliminar un consultorio de un centro de salud');
    });

    // REDES-------------------------------------------------------------------
    describe('> Pruebas con REDES en /api/eaps', function (){
      it('Se puede insertar un centro con redes ya predefinidas');
      it('Se puede crear un centro con redes y consultorios (COMPLETO) basado en Eras');
      it('Se puede anadir una red a un centro de salud');
      it('Se puede eliminar la red del centro de salud');
      it('No se puede eliminar un centro de salud con redes y/o consultorios asociados');
      it('No se puede eliminar un consultorio con redes asociados');
		});

    // RUTAS GENERICAS---------------------------------------------------------
    describe('> Prueba de rutas genericas', function (){
			it('Puede hacer un GET /api/eaps', function (done){
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

      it('Puede hacer un GET en /api/eaps/ideap para conseguir info de un solo EAP', function (done){
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

      it('Un GET a /api/eaps/ideap con una id que no existe devuelve un stus 404', function (done){
        chai.request(server)
          .get('/eaps/58ac1ba4ed9a564598399bed')
          .end((err) => {
            expect(err).to.have.status(404);

            done();
          });
      });
		});
	});
});
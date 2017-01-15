'use strcit';

// Resto de utilidades
const chai       = require('chai');
const chaiHttp   = require('chai-http');
const moment     = require('moment');
const lugarModel = require('../models/lugar.model');
const should     = chai.should();
const expect     = chai.expect;
chai.use(chaiHttp);


describe('[X] Unit tests for the API model: LUGAR', function () {	
	before('Remove all data from EAPs collection', function (done){
		lugarModel.remove({}, done);
		console.log('me ejecuto');
	});

	describe('1) Tests basicos contra la BBDD', function (){
		let armunia = {
			esCentroSalud: true,
			codigo: '170301',
			nombre: 'Armunia',
		};

		it('Se puede salvar un centro con datos basicos (Armunia - 170301 - esCentroSalud)', function (done) {
			new lugarModel(armunia).save(function (err, lugarGuardado) {
				if (err) return done(err);

				lugarGuardado.should.be.a('object');
				lugarGuardado.should.have.property('_id');
				expect(lugarGuardado.nombre).to.be.equal(armunia.nombre);
				expect(lugarGuardado.codigo).to.be.equal(armunia.codigo);
				expect(lugarGuardado.esCentroSalud).to.be.equal(armunia.esCentroSalud);
				
				done();
			});
		});
		
		it('Los campos audit son correctos en el nuevo centro creado'); // BUG: las fechas mal (eso lo se) falta el tema del usuario que aqui no tiene funcion

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
				codigo: '170301',
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
			new lugarModel({}).save(function (err, lugarGuardado){
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

	describe('2) Tests basados en cliente HTTP', function (){
		const server = 'http://localhost:3000/api';

		describe('> Prueba de rutas basicas', function (){
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
		});

		describe('>CRUD basico /api/eaps', function (){
			let armunia = {
				esCentroSalud: true,
				codigo: '170301',
				nombre: 'Armunia',
				direccion: {
					via: 'C/Algo',
					numero: 34,
					cp: 24640,
					localidad: 'León',
					notas: 'Pues unas noticas'
				},
				telefonos: [{
					nombre: 'Teléfono principal',
					numero: '987 00 00 00',
					notas: 'Una nota del teléfono to`guapa'	
				},{
					nombre: 'Teléfono secundario',
					numero: '987 11 11 11',
					notas: 'Es otra nota tetah !'
				}],
				aytoAsociado: 'Ninguno',
				redes: [{
					cidr: '10.37.65.128/25',
					gateway: '10.37.65.129',
					tipo: 'centro',
					notas: 'Una notica guapa !!'
				}]
			};
			
			it('Crea un centro completo (con todos los campos, arrays incluidos) basado en Armunia', function (done){
				chai.request(server)
					.post('/eaps')
					.send(armunia)
					.end((err, res) => {
						if (err) return done(err);

						expect(err).not.exist;
						expect(res).have.status(200);
						expect(res.body).to.be.a('object');
						expect(res.body).have.property('_id');
						expect(res.body).have.property('codigo').equal(armunia.codigo);
						expect(res.body).to.contains.all.keys(Object.keys(armunia)); // have para que no tenga ni mas ni menos que esas keys						
					});
			});
			it('No se puede duplicar el CIDR de una red');
			it('No deberia poderse crear una red que solape el rango de otra');
			it('Los datos de audit (fecha y users) son correctos');
		});
	});
});
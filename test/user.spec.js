'use strcit';

const chai      = require('chai');
const chaiHttp  = require('chai-http');
const userModel = require('../models/user');
const should    = chai.should();
const expect    = chai.expect;
chai.use(chaiHttp);


const baseUser = {
	email: 'ariesmoo@hotmail.com',
	password: 'pitopene'
};
let tokenBaseUser = '';

describe('[X] Unit test for user model and authentication features', function (){	
	before('Remove all data from users collection', function (done){
		userModel.remove({}, done);
	});

	describe('1) Pruebas basicas para el modelo USER', function (){
		let idUser1, idUser2;
		
		describe('>Operaciones basicas directamente en BBDD (mongoose)', function (){
			it('Creacion user basico', function (done){
				new userModel({ 
					email: 'pozi@yonose.com', 
					password: 'pozi' 
				}).save(function (err, userGuardado) {
					if (err) return done(err);
					
					idUser1 = userGuardado._id;
					done();
				});
			});

			it('Creacion segundo usuario');
			it('Puede buscar al primer usuario por su email');
			it('Eliminacion usuario (segundo user)');
			it('Modificacion primer usuario');
			it('Se comprueba la contraseña de usuaio (valida)');
			it('Se comprueba que la contraseña (invalida) no se reconoce');
			it('No se ELIMINAN usuarios que no existen y nada se rompe');
			it('No se MODIFICAN usuarios que no existen y nada se rompe');
		});

		describe('>Operaciones a traves de la web (node)', function (){
			const server 	= 'http://localhost:3000';
			
			before('Remove all data from users collection', function (done){
				userModel.remove({}, done);
			});

			it('Se puede crear usuario (baseUser) via web', function (done){
				chai.request(server)
					.post('/user')
					.send(baseUser)
					.end((err, res) => {
						expect(err).not.exist;
						res.should.have.status(200);
						res.body.should.be.a('object');
						expect(res.body.user.email).to.be.equal(baseUser.email);
						expect(res.body.token).to.exist;

						tokenBaseUser = res.body.token;
						done();
					});
			});
			it('No se permite duplicar el email');
			it('No se rompe nada al no pasar ningun dato');
			it('Es posible crear un segundo usuario');
			it('Es posible borrar un usuario');
		});
	});

	describe('2) Pruebas de autenticacion', function (){
		const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODdhMTk4MWFkZjQ1OTIzM2ViZmE5YjMiLCJpYXQiOjE0ODQzOTY5MjksImV4cCI6MTQ4NTI2MDkyOX0.B16INb8FMwHMmVY5--nZbLZU4lIDFH4QHE2e791yQiQ';
		
		it('Se puede hacer un GET /user con chai-http seteando un header "autorization: bearer ´token´', function (done){
			chai.request('http://localhost:3000')
				.get('/user')
				.set('Authorization', `Bearer ${token}`)
				.end(function (err, res){
					expect(err).to.not.exist;
					expect(res).to.have.status(200);
					// console.log(res.body);
					// TODO: hacer mas pruebas (si users es un array, cuantos users deberia haber, etc..)

					done();
				});
		}); 
		it('No se puede acceder con GET /user y un token invalido'); //OJO: pq aqui a mi me chuta ?? //FIXME: si se elimina al user (o se cambia) el token seguiria siendo valido? OMG !! 
		it('No se puede acceder con GET /user y un token mal formado');
		it('No se puede acceder con GET /user y un token caducado');
	});
});
// Se trabaja con nuestra propia instancia de mongoose, por lo que hay que conectarse de nuevo a la BBDD
// La instancia que ya esta asociada a express, no va del todo bien si se exporta y se importa aqui
// Sin esto no funcionan bien las pruebas contra mongoose. Me ha dado 10000000 problemas :/
const mongoose   = require('mongoose');
const dbURI 	 = require('../config/config').db;

before('Comprueba que mongoose este arriba. Si no lo esta, genera la conexion', function (done){
	if (mongoose.connection.db) return done();
	else {
    // Usamos Promesas standar de node (ES6) y conectamos mongoose a Mongo
    mongoose.Promise = global.Promise;
    mongoose.connect(dbURI, done);
  }
});
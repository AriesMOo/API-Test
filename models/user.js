'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs'); // Para cifrar los passwords

const userSchema = mongoose.Schema({
	email: { 
    type: String, 
    unique: true, 
    lowercase: true,
    required: true
    // match: RegExp qeu revise que sea un email
  }, 
  password: { 
    type: String, 
    select: false, // NOTE: el select: false hace que cada vez que consultemos el user, el password NO se envie nunca !!
    required: true
  }, 
  signupDate: { 
    type: Date, 
    default: Date.now() // NOTE: si no se pone nada, se pone la fecha del server AUTOMATICAMENTE !
  }, 
  lastLogin: Date
});

/* Funcion que se invoca ANTES (pre) de salvar -> (next es el siguiente hook, 
si lo hay). Sirve para hashear la contraseña antes de guardarla */
/* USAR sin arrow function pq a mongoose no le gusta aqui (cambia el valor de 
this y no hay forma de hacerlo funcionar bien si no es así */
userSchema.pre('save', function (next) {
  let user = this; // Pq estamos en el userSchema ;)
  
  // Si no se ha modificado el password o no es nuevo... no hay que hacer nada
  if (!user.isModified('password') || !user.isNew) // FIXME: ojo !! revisar este || pq creo que es && (ver function ensureAuthenticationMiddleware de user.controller.js)
    return next();
  
  // 1) Generamos el salt (por defecto son 10 asi que esto no haria falta en realidad)
  bcrypt.genSalt(10, (err, salt) => {
    if (err)
      return next(err);
    
    // 2) hasheamos la contraseña pasada con el pass plano y el salt
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err)
        return next(err);
      
      // 3) guardamos el hash pepino en el campo user.password
      user.password = hash;
      next(); // E invocamos lo siguiente (que en este caso será guardarlo en mongo)
    });
  });
});

userSchema.methods.comparePassword = (passw, callback) => {  
  bcrypt.compare(passw, this.password, (err, isMatch) => {
    if (err)
      return callback(err);
    else 
      return callback(null, isMatch);
  });
};

// Se exporta el modelo 
module.exports = mongoose.model('User', userSchema);

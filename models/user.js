'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs'); // Para cifrar los passwords
const crypto   = require('crypto'); // Para gravatar
const Schema   = mongoose.Schema;

const userSchema = Schema({
	email: { type: String, unique: true, lowercase: true }, // NOTE: UNIQUE y en lowercase todo (da igual que lo pasen con mayus)
  displayName: String,
  avatar: String, // En realiadd es una url
  password: { type: String, select: false }, // NOTE: el select: false hace que cada vez que consultemos el user, el password NO se envie nunca !!
  signupDate: { type: Date, default: Date.now() }, // NOTE: si no se pone nada, se pone la fecha del server AUTOMATICAMENTE !
  lastLogin: Date
});

/* Funcion que se invoca ANTES (pre) de salvar -> (next es el siguiente hook, 
si lo hay). Sirve para hashear la contraseña antes de guardarla */
userSchema.pre('save', (next) => {
  let user = this; // Pq estamos en el userSchema ;)
  
  // Si no se ha modificado el password... no hay que hacer nada
  if (!user.isModified('password'))
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

userSchema.methods.gravatar = function () {
  // Si no tiene email, se asigna un avatar aleatorio
  if (!this.email)
    return 'https://gravatar.com/avatar/?s=200&d=retro';

  // Si tiene email igual tienen  un avatar salvado en gravatar
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=200&d=retro`;
};

// Se exporta el modelo 
module.exports = mongoose.model('User', userSchema);

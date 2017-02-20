'use strict';

const log4js = require('log4js');
const config = require('./config');

// Config de los logs. NOTA: la category debe coincidir con el nombre del logger es la forma en que se relacionan
log4js.configure({
 appenders: [
   { type: 'console' }, // Este es el logger 'default'
   { type: 'file', filename: './probando-logging.log', category: 'stockApp' }
  ]
});

// Se establece el nivel de log a almacenar/mostrar por defecto
if (config.production)
  log4js.setGlobalLogLevel('ERROR');
else
  log4js.setGlobalLogLevel('DEBUG');

module.exports = log4js;
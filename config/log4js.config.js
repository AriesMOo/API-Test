'use strict';

const log4js = require('log4js');

// Config de los logs. NOTA: la category debe coincidir con el nombre del logger es la forma en que se relacionan
log4js.configure({
 appenders: [
   { type: 'console' },
   { type: 'file', filename: './probando-logging.log', category: 'stockApp' }
  ]
});

// Se establece el nivel de log a almacenar/mostrar por defecto
log4js.setGlobalLogLevel('ERROR');

module.exports = log4js;
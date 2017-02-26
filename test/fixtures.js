let armunia = {
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
  aytoAsociado: 'Ninguno'
};

let cembranos = {
  codigo: '17030136',
  nombre: 'Cembranos'
};

let grulleros = {
  codigo: '17030140',
  nombre: 'Grulleros'
};

module.exports = {
  armunia,
  cembranos,
  grulleros
};
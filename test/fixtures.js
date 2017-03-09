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
  aytoAsociado: 'Ninguno'
};

let cembranos = {
  esCentroSalud: false,
  codigo: '17030136',
  nombre: 'Cembranos'
};

let grulleros = {
  esCentroSalud: false,
  codigo: '17030140',
  nombre: 'Grulleros'
};

let redArmunia = {
  cidr: '10.46.210.0/26',
  gateway: '10.46.210.1',
  tipo: 'centro',
  notas: 'Son unas noticas...'
};

let equipoArmunia = {
  nombre: 'gaple1710ss0301',
  tipo: 'PC'
};

module.exports = {
  armunia,
  cembranos,
  grulleros,
  redArmunia,
  equipoArmunia
};
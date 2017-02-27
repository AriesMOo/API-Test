
## API-test (expressjs + mocha + ES6)
Es una pequeña prueba de concecpto para seguir el tutorial de API Rest con node.js de Carlos Azaustre

### Current Version
1.0.0

### Author
Miguel Pride

### License

GPLv3
### Nota para developers
Siempre se ha de utilizar (en al medida de lo posible) funciones 'puras', es
decir, se prescindira de *arraw functions (=>)* porque mongoose y mocha no se llevan
muy bien con el bind de cada this.
Como unas veces funciona y otras no, es preferible *no usarlas nuca*
# Cosas que no van y principales dificultades

* Los schemas solo se pueden embeber (hacer sub-doc) unos dentro de otros si el
padre tiene un array de hijos. Si por ejemplo se crea un schemaAudit y se trata
de embeber en un campo audit: auditSchema... pues... NO VA !!

* Las validaciones no van del todo bien cuando se hace un findOne dentro de ellas
Es como que la accion se queda en el callback (err, dispositivos) => y ya no hay
nada que hacer. Para que chute bien hay que ponerlo en modo serie utilizando la
bandera true (espera a que finalice todo con done) y al final le casca un next()
http://stackoverflow.com/questions/13582862/mongoose-pre-save-async-middleware-not-working-as-expected

# Dudas

WTF is going on with the promises. Al ser asincronas... no churrula bien los return next(new Error())
pq creo que se salen de la rutina de la promesa/consulta y no del flujo principal del schema.pre('validate')
o schema.pre('save')
ASINCRONIA amigo... asincronia... todo es culpa de la puta asincronia.
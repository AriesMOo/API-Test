'use strict';

const ipOps      = require('ip');
const lugarModel = require('../models/lugar.model');

function getLugares (req, res) {
    lugarModel.find({}, (err, lugares) => {
        if (!lugares || lugares.length == 0) 
            return res.status(404).send({ message: 'No hay centros/consultorios' });

        res.status(200).send(lugares);
    });
}

// NOTA: para los telefonos, las redes y los consultorios (y los arrays en general)
// es mejor hacer una funcion aparte (con su ruta adicional) en plan /api/eaps/eapID/actualizarDireccion
// Si hay dos telefonos que poner/actualizar, habria que llamar 2 veces a la ruta desde el front-end/angular
// O en su defecto, trincar la primera directametne, y la 2ª hacerlo con actualizacion
function saveLugar (req, res) {
    const userID = req.userID; // TODO: incluir en el audit. Siempre habra un userID por el ensureAuthentication
    let nuevoLugar = new lugarModel();
    
    // Ñapeamos esto para evitar que nos tire erro la funcion que parsea el body
    /* let cidr = req.body.cidr;
    delete req.body.cidr;
    let gateway = ipOps.toLong(req.body.gateway);
    delete req.body.gateway;
    let tipoRed = req.body.tipoRed;
    delete req.body.tipoRed;*/

    nuevoLugar = _extraeConformaBodyData(req.body, nuevoLugar);
    if (nuevoLugar instanceof Error)
        return res.status(400).send({ Error: `${nuevoLugar.message}` });
    else {
        // Temporalmente le añadimos la red asi
        /* nuevoLugar.redes.push({
            cidr: cidr,
            gateway: gateway,
            tipo: tipoRed,
        });*/

        // FIXME: comprobar que al menos los campos oblitatorios estan presentes (schmea.requiredPaths)
        nuevoLugar.save(function (err, lugarGuardado) {
            if (err) 
                return res.status(500).send({ message: `Error: No se ha podido guardar en la BBDD. ${err}` });

            res.status(200).send({ lugarGuardado });
        });
    }
}

function getLugar (req, res) {
    res.status(200).send({ message: `stub message para ${req.params.lugarID}` });
}

function updateLugar (req, res){
    const lugarID = req.params.lugarID;
    const userID = req.userID; // TODO: incluir en el audit. Siempre habra un userID por el ensureAuthentication

    lugarModel.findById(lugarID, function (err, lugar){
        if (!lugar) 
            return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });
        
        let lugarActualizado = _extraeConformaBodyData(req.body, lugar);
        if (lugarActualizado instanceof Error)
            return res.status(400).send({ Error: `${lugarActualizado.message}` });
        else {
            lugarActualizado.save(function (err, lugarGuardado) {
                if (err) 
                    return res.status(500).send({ Error: `Problema al guardar el documento en la BBDD --> ${err}` });

                res.status(200).send({ lugarGuardado });
            });
        }
    });
}

// CONSULTORIOS
let consultoriosHandler = {
    anadeConsultorio: function (req, res){
        const consultorioID = req.body.consultorioID;
        const centroID = req.params.lugarID;

        if (!consultorioID)
            return res.status(400).send({ message: 'No se ha suministrado ID de consultorio' });
        
        lugarModel.findById(consultorioID, function (err, consultorio){
            if (!consultorio)
                return res.status(400).send({ message: 'ID no corresponde con ningun consultorio' });

            if (consultorio.esCentroSalud)
                return res.status(400).send({ message: 'El ID del consultorio es un centro de salud (no se pueden anidar centros de salud)' }); 
        });

        lugarModel.findById(centroID, function (err, centroSalud){
            if (!centroSalud) 
                return res.status(400).send({ message: 'ID no corresponde a ningun EAP' });
            
            if (!centroSalud.esCentroSalud)
                return res.status(400).send({ message: 'El ID del EAP es un consultorio y no puede tener asociados otros consultorios' }); 
                //TODO: pasar este metodo a validators del model con isNew (recorrer todos los consultoriosID y si algunos es isNew revisar que )
                // NO NO, mejor comprobar que si hay consultorios, sea pq el flag esCentroSalud es igual a true

            console.log(centroSalud);                       
            centroSalud._consultorios.push(consultorioID);
            console.log('==================');
            console.log(centroSalud);
            centroSalud.save(function (err,centroGuardado){
                if (err) 
                    return res.status(500).send({ Error: `Problema al guardar el documento en la BBDD --> ${err}` });

                res.status(200).send({ centroGuardado });
            });

        });
    },
    borraConsultorio: function (req, res){

    }
};


// function updateConsultario (req, res){
//     OJO: se actualiza un lugar(eap) directamente. Aqui no se hace nada (borar _id o añandir _id solo)
// }


// TELEFONOS
function anadeTelefono (req, res){

}

function updateTelefono (req, res){

}

function borraTelefono (req, res){

}

/**
 * Ahorra el hecho de estar haciendo
 *      model.prop1 = req.body.prop1; 
 *      model.prop2 = req.body.prop2; 
 *      model.prop3 = req.body.prop3;
 * Especialmente util para los updates.
 * Ademas, revisa que los campos pasados esten contemplados en el schemma del 
 * modelo, de forma que si hay un typo o se quiere actualizar algo que no existe
 * en el propio modelo, se avisa y no se hace nada. 
 * Adicionalmente, se puede intentar validar sin ejecutar el metodo save o update
 */
function _extraeConformaBodyData (bodyData, model) {
    // Metemos los campos del schema en un array schemaPaths para comprobar despues
    let schemaPaths = [];
    model.schema.eachPath(function (path){
        schemaPaths.push(path);
    });

    // console.log(schemaPaths);
    
    // Iteramos sobre cada parametro pasado en el body, a ver si esta en el schema
    // _.each(req.body, function (value, key){ -> con esto no escapa del bucle (each) al poner return res.status(400)
    for (let key in bodyData) {
        // if (req.body.hasOwnProperty(key)) { (no hace falta pq no hay metodos base heredados [prototipados])
        /* let pathValido = false;
        
        for (let i = 0; i < schemaPaths.length; i++){
            if (key === schemaPaths[i]){
                pathValido = true;
                break;
            }
        }

        if (!pathValido)
            return new Error(`El parametro ${key} pasado al server no existe en la estructura de la BBDD`);
        else  */
            model[key] = bodyData[key];
    }
    
    // OJO: Que pase la validacion no significa que sea valido del todo
    // (no mira duplicaciones de clave [unique], y el tema de los campos con arrays)
    // validarlo aqui NO SIRVE (model.validate(fn))

    return model;
}

module.exports = {
    getLugares,
    saveLugar,
    getLugar,
    updateLugar,
    redesHandler,
    consultoriosHandler
};
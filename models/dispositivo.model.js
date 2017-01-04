'use strict';

const mongoose = require('mongoose');

const dispositiveSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    IPs: [{
        IP: { type: String, unique: true },
        networkID: { type: mongoose.Schema.Types.ObjectId, unique: true }
    }],
    dispType: { type: String, enum: ['PC', 'Portátil', 'Impresora', 'Equipo de red', 'Servidor', 'Impresora CPC', 'Reservada']},
    technicalData: {
        manufacturer: String,
        model: String,
        memory: String,
        procesador: String,
        // HD: [String]
        HD: String
    },
    phsysicalLocation: String,
    notes: String,
    audit: {
        _createdBy: mongoose.Schema.Types.ObjectId,
        _updatedBy: mongoose.Schema.Types.ObjectId
    }    
}, { timestamps: { createdAt: 'created_at' } }); // FIXME: quitar los timestamps y dejarlos a mano dentro de audit

module.exports = mongoose.model('Dispositive', dispositiveSchema);
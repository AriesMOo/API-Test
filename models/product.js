'use strict';

// Se declaran los objetos 'base' a usar
const mongoose = require('mongoose');
const Schema = mongoose.Schema;	

// Definimos Schema
const ProductSchema = Schema({
	name: String,
	picture: String,
	price: Number,
	category: { type: String, enum: ['computers', 'phones', 'accesories'] }, // Es un enum (la eleccion final sera de tipo string) solo se permiten estas opciones
	description: String														 // Si no se pasa una categoria correcta SE IGNORA (aunque a mi me da error y fuego)
});

// Se exporta el modelo (nombre - schema)
module.exports = mongoose.model('Product', ProductSchema);
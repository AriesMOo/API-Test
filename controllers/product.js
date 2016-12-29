'use strict';

// Importamos modelos mongoose (ojo, al no ser paquetes npm, hay que especificar la ruta en el require)
const Product = require('../models/product');

function getProduct (req, res){
  // Guardamos el ID que viene como ruta /api/product/añlsfañslfj
  let productId = req.params.productId;

  // Consultamos a la BBDD (callback con err y producto devuelto)
  Product.findById(productId, (err, product) => {
    if (err)  // Si hay un error, 500 y fuera
      return res.status(500).send({ message: `Error al realizar la petición a la BBDD: ${err}` });
    if (!product)  // Si no encuentra el producto, 404 y fuera
      return res.status(404).send({ message: 'El producto no existe' });

    res.status(200).send({ product });  // Si llega aqui es que ha encontrado el producto por el ID
  });
}

function getProducts (req, res){
  // Es parecida a la funcion anterior
  Product.find({}, (err, products) => {
    if (err)
      return res.status(500).send({ message: `Error al realizar la consulta a la BBDD: ${err}` });
    if (!products)
      return res.status(404).send({ message: 'No hay productos guardados todavía' });

    res.status(200).send({ products });
  });
}

function saveProduct (req, res){
  console.log(req.body);

  // Creamos un producto
  let product = new Product();
  product.name = req.body.name;
  product.picture = req.body.picture;
  product.price = req.body.price;
  product.category = req.body.category;
  product.description = req.body.description;
  
  // Se salva el producto (callback con error - objetosalvado)
  product.save((err, productStored) => {
    if (err)
      res.status(500).send({ message: `Error al salvar en la BBDD: ${err}` });
    else 
      res.status(200).send({ message: productStored });
  });
}

function updateProduct (req, res){
  let productId = req.params.productId;
  let bodyProductUpdate = req.body; // Objeto a actualizar (aqui vendran los campos bien formados se entiende)

  // a esta funcion guai se le pasa el id del objeto, los datos a actualziar, y el callback ;)
  Product.findByIdAndUpdate(productId, bodyProductUpdate, (err, productUpdated) => {
    if (err)
      res.status(500).send({ message: `Error al actualizar el producto: ${err}` });
    else
      res.status(200).send({ message: 'Producto actualizado correctamente' });
  });
}

function deleteProduct (req, res){
  let productId = req.params.productId;

  Product.findById(productId, (err, product) => {
    if (err)
      return res.status(500).send({ message: `Error al consultar a la BBDD: ${err}` });
    
    product.remove(err => {
      if (err)
        return res.status(500).send({ message: `Error al eliminar producto: ${err}` });
      
      res.status(200).send({ message: 'Producto eliminado correctamente' });
    });
  });  
}

module.exports = {
    getProduct,
    getProducts,
    saveProduct,
    updateProduct,
    deleteProduct
};

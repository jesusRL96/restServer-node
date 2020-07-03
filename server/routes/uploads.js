const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');


// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ningun archivo'
      }
    });
  }

  // Validacion de tipos
  let tipos = ['usuarios', 'productos'];
  if(tipos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Tipo no valido'
      }
    });
  }


  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
 let archivo = req.files.archivo;
 let extension = archivo.name.split('.')[archivo.name.split('.').length - 1];

 // console.log(archivo.name.split('.')[0]);
 // console.log(archivo.name.split('.')[1]);

 // Extenciones permitidas
 let extenciones = ['jpg', 'png', 'gif', 'jpeg'];

 if(extenciones.indexOf(extension) < 0) {
   return res.status(400).json({
     ok: false,
     err: {
       message: 'extencion no valida'
     }
   });
 }

 // cambiando nombre de archivo
 let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

 // Use the mv() method to place the file somewhere on your server
  archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, function(err) {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if(tipo === 'usuarios') imagenUsuario(id, res, nombreArchivo);
    else imagenProducto(id, res, nombreArchivo);


  });

});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo('nombreArchivo', 'usuarios');
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!usuarioDB) {
      borraArchivo('nombreArchivo', 'usuarios');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'id no encontrado'
        }
      });
    }

    borraArchivo(usuarioDB.img, 'usuarios');

    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        image: nombreArchivo
      });
    });

  });
}


function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borraArchivo('nombreArchivo', 'productos');
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB) {
      borraArchivo('nombreArchivo', 'productos');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'id no encontrado'
        }
      });
    }

    borraArchivo(productoDB.img, 'productos');

    productoDB.img = nombreArchivo;
    productoDB.save((err, productoGuardado) => {
      res.json({
        ok: true,
        usuario: productoGuardado,
        image: nombreArchivo
      });
    });

  });
}



function borraArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

  if(fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;

const express = require('express');
const {verificaToken} = require('../middlewares/autenticacion.js');

let app = express();
let Producto = require('../models/producto.js');
// ==============================
// Mostrar todos los productos
// ==============================
app.get('/productos', verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  let hasta = req.query.hasta || 5;
  desde = Number(desde);
  hasta = Number(hasta);

  Producto.find({disponible: true})
      .skip(desde)
      .limit(5)
      .populate('usuario', 'nombre email')
      .populate('categoria', 'descripcion')
      .exec((err, productos) => {
        if(err) {
          return res.status(500).json({
            ok: false,
            err: err
          });
        }

        res.json({
          ok: true,
          productos: productos
        });
      });

});

// ==============================
// Mostrar un producto por ID
// ==============================
app.get('/productos/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoDB) => {
      if(err) {
        return res.status(500).json({
          ok: false,
          err: err
        });
      }

      if(!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'producto no encontrado'
          }
        });
      }

      res.json({
        ok: true,
        productos: productoDB
      });

    });

});

// ==============================
// Buscar un producto
// ==============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regExp = RegExp(termino, 'i');

  Producto.find({nombre: regExp})
      .populate('categoria', 'descripcion')
      .exec((err, productos) => {
        if(err) {
          return res.status(500).json({
            ok: false,
            err: err
          });
        }

        res.status(201).json({
          ok: true,
          productos: productos
        });

      });
});

// ==============================
// Crear un producto
// ==============================
app.post('/productos', verificaToken, (req, res) => {
  let body = req.body;
  let producto = new Producto({
    usuario: req.usuario._id,
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria
  });

  producto.save((err, productoDB) => {
    if(err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }

    if(!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'producto no encontrado'
        }
      });
    }

    res.status(201).json({
      ok: true,
      producto: productoDB
    });

  });

});

// ==============================
// Actualizar un producto
// ==============================
app.put('/productos/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let modificacion = {
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria
  };

  Producto.findByIdAndUpdate(id, modificacion, {new: true, runValidators: true}, (err, productoDB) => {
    if(err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }

    if(!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'producto no encontrado'
        }
      });
    }


    res.status(201).json({
      ok: true,
      producto: productoDB
    });

  });
});

// ==============================
// Deshabilitar un producto
// ==============================
app.delete('/productos/:id', verificaToken, (req, res) => {
  let id = req.params.id;

  Producto.findById(id, (err, productoDB) => {
    if(err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }

    if(!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'producto no encontrado'
        }
      });
    }

    productoDB.disponible = false;
    productoDB.save((err, productoBorrado) => {
      if(err) {
        return res.status(500).json({
          ok: false,
          err: err
        });
      }

      res.json({
        ok: true,
        producto: productoBorrado
      });

    });
  });

});


module.exports = app;

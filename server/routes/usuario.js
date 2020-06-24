const express = require('express');
const _ = require("underscore");
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, function (req, res) {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);

  Usuario.find({estado: true}, 'nombre email role')
    .limit(limite)
    .skip(desde)
    .exec((err, usuarios) => {
      if(err) {
        return res.status(400).json({
          ok: false,
          err: err
        });
      }

      Usuario.count({}, (err, conteo) => {
        res.json({
          ok: true,
          usuarios,
          cuantos: conteo
        });
      });

    });
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role:body.role
  });

  usuario.save((err, usuarioDB) => {
    if(err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }
    // usuarioDB.password = null;
    res.json({
      ok: true,
      usuario: usuarioDB
    })

  });

  // if (body.nombre === undefined) {
  //   res.status(400).json({
  //     ok: false,
  //     mensaje: "El nombre es necesario"
  //   });
  //
  // } else {
  //   res.json({
  //     persona: body
  //   });
  //}
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
  let id = req.params.id;
  let body = _.pick(req.body, ['nombre', 'email', 'img', 'role']);


  Usuario.findByIdAndUpdate(id, body,{new: true, runValidators: true}, (err, usuarioDB) => {
    if(err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    });
  });
});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
  let id = req.params.id;
  let metodoBorrado = req.query.metodo;
  if (metodoBorrado === 'permanente') {
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {    // elimina de forma permanente el usuario
      if(err || usuarioBorrado == null) {
        return res.status(400).json({
          ok: false,
          err: err || 'Usuario no encontrado'
        });
      }
      res.json({
        ok: true,
        usuario: usuarioBorrado
      });
    });
  } else {
    Usuario.findByIdAndUpdate(id, {estado: false},{new: true, runValidators: true}, (err, usuarioDB) => {
      if(err) {
        return res.status(400).json({
          ok: false,
          err: err
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB
      });
    });
  }


});

module.exports = app;

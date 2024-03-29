const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {
  let body = req.body;

  Usuario.findOne({email: body.email}, (err, usuarioDB) => {
    if(err) {
      return res.status(500).json({
        ok: false,
        err: err
      });
    }
    if(!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "(Usuario) o contraseña incorrectos"
        }
      });
    }

    if(!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o (contraseña) incorrectos"
        }
      });
    }

    let token = jwt.sign({
      usuario: usuarioDB
    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token
    });

  });

});

// Configuraciones de google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  console.log(payload);
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}
// verify().catch(console.error);

app.post('/google', async (req, res) => {
  let token = req.body.idtoken;
  let googleUser = await verify(token)
    .catch(e => {
      return res.status(403).json({
        ok: false,
        err: e
      });
    });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
      if(err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if(usuarioDB) { // Si el usuario existe en la base de datos
        if(usuarioDB.google === false) {
          returnres.status(400).json({
            ok: false,
            err: {
              message: 'debe usar la autenticacion normal'
            }
          });
        }else {
          let token = jwt.sign({
            usuario: usuarioDB
          }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

          return res.json({
            ok: true,
            usuario: usuarioDB,
            token
          });
        }
      } else {
        // El usuario no existe en la base de datos
        let usuario = new Usuario();
        usuario.nombre = googleUser.nombre;
        usuario.email = googleUser.email;
        usuario.img = googleUser.img;
        usuario.google = true;
        usuario.password = ':)';

        usuario.save((err, usuarioDB) => {
          if(err) {
            return res.status(500).json({
              ok: false,
              err
            });
          } else {
            let token = jwt.sign({
              usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.json({
              ok: true,
              usuario: usuarioDB,
              token
            });
          }
        })
      }
    });

  // res.json({
  //   ok: true,
  //   usuario: googleUser
  // });

});


module.exports = app;

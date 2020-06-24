const jwt = require('jsonwebtoken');
// ======================
// Verificar token
// ======================
let verificaToken = (req, res, next) => {
  let token = req.get('token');
  // res.json({
  //   token: token
  // });

  // console.log(token);
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if(err) {
      return res.status(400).json({
        ok: false,
        err: err
      });
    }

    req.usuario = decoded.usuario
    next();
  });
};
// ======================
// Verificar AdminRole
// ======================
let verificaAdmin_Role = (req, res, next) => {
  let usuario = req.usuario;

  if(usuario.role === "ADMIN_ROLE") {
    next();
  }else {
    return res.json({
      ok: false,
      err: {
        message: 'El usuario no es administrador'
      }
    });
  }


}


// ======================
// Exports
// ======================
module.exports = {
  verificaToken,
  verificaAdmin_Role
}

require('./config/config.js');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// habilitar carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuracion global de rutas
app.use(require('./routes/index.js'));

mongoose.connect(process.env.URLDB,
        {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true},
        (err, res) => {
  if(err) throw err;
  else console.log('base de datos online');
});

app.listen(process.env.PORT);
console.log("escuchando puerto: ", process.env.PORT);

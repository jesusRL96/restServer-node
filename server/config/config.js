// PORT
process.env.PORT = process.env.PORT || 3000;

// ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Fecha de expiracion
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN =  60 * 60 * 24 * 30;

// SEED de autenticacion
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

// BASE DE DATOS
let urlDB;
if(process.env.NODE_ENV === 'dev') urlDB = 'mongodb://localhost:27017/cafe';
else urlDB = process.env.MONGO_URI;

// urlDB = 'mongodb+srv://usuario1:1dBQt78TgW2lOGgW@cluster0-pj2tn.mongodb.net/cafe';
process.env.URLDB = urlDB;

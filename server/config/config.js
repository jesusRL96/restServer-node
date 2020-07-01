// PORT
process.env.PORT = process.env.PORT || 3000;

// ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Fecha de expiracion
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN =  "48h";

// SEED de autenticacion
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

// GOOGLE CLIENT ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '565369592864-80svr9optv7easbl009ji35ru3cceiq4.apps.googleusercontent.com';
// BASE DE DATOS
let urlDB;
if(process.env.NODE_ENV === 'dev') urlDB = 'mongodb://localhost:27017/cafe';
else urlDB = process.env.MONGO_URI;

// urlDB = 'mongodb+srv://usuario1:1dBQt78TgW2lOGgW@cluster0-pj2tn.mongodb.net/cafe';
process.env.URLDB = urlDB;

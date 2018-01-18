let mongoose = require('mongoose');

/********************* DEFINE DATABASE SETTINGS ************************/


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
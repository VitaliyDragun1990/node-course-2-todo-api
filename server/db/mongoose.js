let mongoose = require('mongoose');

/********************* DEFINE DATABASE SETTINGS ************************/

// assign our own promise library
mongoose.Promise = global.Promise;
// open mongoose connection to database
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
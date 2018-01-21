/********************* CONFIGURE ENVIRONMENT ************************/

// make this changes to have different databases for development and testing proposes
let env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    // read config data from json config file
    let config = require('./config.json');
    // grab config property depending on env value
    let envConfig = config[env];
    // loop through config property and set them to process.env
    Object.keys(envConfig).forEach((key) => {
       process.env[key] = envConfig[key];
    });
}
let {User} = require('./../models/user');

// define middleware function for user authentication
let authenticate = (req, res, next) => {
    // grab token from the headers
    let token = req.header('x-auth');
    // find user using token
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();  // throws us to catch handler at the end
        }
        // if authentication was successful, modify request object
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};

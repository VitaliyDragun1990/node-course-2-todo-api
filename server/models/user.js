const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

/********************* DEFINE USER MODEL ************************/

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email!'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

                /******* OVERRIDE EXISTING METHODS ON A SCHEMA *******/

// this method defines what exactly gets send back when the mongoose
// model is converted into a json value
UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();   // create object from user schema

    return _.pick(userObject, ['_id', 'email']);
};

                /******* DEFINE CUSTOM  METHODS ON A SCHEMA *******/

// don't use arrow function because we need access to 'this' keyword
UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});
    // return promise which contains auth. token
    return user.save().then(() => {
        return token;
    });
};

// remove auth token from user object in database -> logout user
UserSchema.methods.removeToken = function (token) {
    let user = this;
    // $pull -> pull from tokens array any object, which property token equals given token
    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

            /******* DEFINE CUSTOM  METHODS ON A MODEL *******/

// this method find user using given token
UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
      decoded = jwt.verify(token, 'abc123');
    } catch (e) {   // if authentication is failed
        return Promise.reject();    // we'll return rejected promise
    }
    // if authentication is success
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': decoded.access
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({email}).then((user) => {
     if (!user) {
         return Promise.reject();
     }

     return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                resolve(user);
            } else {
                reject();
            }
        });
     });
  });
};

                /******* ADD MIDDLEWARE TO USER SCHEMA *******/

// Run before 'save' event (to hash user password and save hash to database)
UserSchema.pre('save', function (next) {
    let user = this;
    // check if password is modified  - if true -> hash it again
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// define model for User
let User = mongoose.model('User', UserSchema);

module.exports = {User};
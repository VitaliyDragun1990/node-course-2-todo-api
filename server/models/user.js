const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

// override existing method on a schema
// this method defines what exactly gets send back when the mongoose
// model is converted into a json value
UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();   // create object from user schema

    return _.pick(userObject, ['_id', 'email']);
};

// create custom instance method on our schema
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

// define custom method on the model
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

// define model for User
let User = mongoose.model('User', UserSchema);

module.exports = {User};
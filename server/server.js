require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');
let {authenticate} = require('./middleware/authenticate');

let app = express();
// define port variable to make possible heroku deployment
const port = process.env.PORT;

// configuring the middleware to parse request body into js object
app.use(bodyParser.json());

 /*********** DEFINE ROUTE HANDLERS **************/

// POST '/todos' -> create a new todo
app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });
    todo.save().then((todo) => {
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    })
});

// GET '/todos' -> retrieve all existing todos
app.get('/todos', (req, res) => {
    Todo.find({}).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// GET '/todos/:id' -> retrieve existing todo by id
app.get('/todos/:id', (req, res) => {
    let id = req.params['id'];
    // validate the id
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => res.send(400).send());

});

// DELETE '/todos/:id' -> delete existing todo
app.delete('/todos/:id', (req, res) => {
    let id = req.params['id'];

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(id).then(todo => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((e) => res.status(400).send());
});

// PATCH '/todos/:id' -> update existing todo
app.patch('/todos/:id', (req, res) => {
    let id = req.params['id'];
    // get only specific property from request body
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }
    // if completed boolean and it's true
    if (_.isBoolean(body.completed) && body.completed) {
        // set completedAt timestamp
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    // update the database
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
        // if there wasn't todo with such id, return 404 with empty body
        if (!todo) {
            return res.status(404).send();
        }
        // if update successful, return todo as property of the response body
        res.send({todo});
    }).catch(e => res.status(400).send());
});


// POST '/users' -> create new user
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save().then(() => {
       return user.generateAuthToken();
    }). then((token) => {
        res.header('x-auth', token).send(user)
    }).catch((e) => res.status(400).send(e));
});

// define route handler with middleware
// GET '/users/me' -> return information about current user
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST '/users/login' {email, password} -> login with given credentials
app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user)
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

// start express application
app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};
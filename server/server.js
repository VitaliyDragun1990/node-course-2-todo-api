require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');
let {authenticate} = require('./middleware/authenticate');

// create express application
let app = express();
// define port variable to make possible heroku deployment
const port = process.env.PORT;

// configuring the middleware to parse request body into js object
app.use(bodyParser.json());

 /*********** DEFINE ROUTE HANDLERS **************/

 /************* TODOS ROUTES **********************/

// POST '/todos' -> create a new todo for currently logged in user
app.post('/todos', authenticate, async (req, res) => {
    let _todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    try {
        const todo = await _todo.save();
        res.send({todo});
    } catch (e) {
        res.status(400).send(e);        // 400 - Bad Request
    }
});

// GET '/todos' -> retrieve all existing todos for current user
app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({_creator: req.user._id});
        res.send({todos});
    } catch (e) {
        res.status(400).send(e);    // 400 - Bad Request
    }
});

// GET '/todos/:id' -> retrieve existing todo by id
app.get('/todos/:id', authenticate, async (req, res) => {
    const id = req.params['id'];
    // validate the id
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();      // 404 - Not Found
    }

    try {
        let todo = await Todo.findOne({_id: id, _creator: req.user._id});
        if (!todo) {
            return res.status(404).send();  // 404 - Not Found
        }
        res.send({todo});
    } catch (e) {
        res.send(400).send(); // 400 - Bad Request
    }
});

// DELETE '/todos/:id' -> delete existing todo
app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params['id'];

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();  // 404 - Not Found
    }

    try {
        const todo = await Todo.findOneAndRemove({_id: id, _creator: req.user._id});
        if (!todo) {
            return res.status(404).send();       // 404 - Not Found
        }
        res.status(200).send({todo});            // 200 - OK
    } catch (e) {
        return res.status(404).send();       // 404 - Not Found
    }
});

// PATCH '/todos/:id' -> update existing todo
app.patch('/todos/:id', authenticate, async (req, res) => {
    const id = req.params['id'];
    // get only specific property from request body
    const body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();          // 404 - Not Found
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
    try {
        let todo = await Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true});
        if (!todo) {
            return res.status(404).send();      // 404 - Not Found
        }
        // if update successful, return todo as property of the response body
        res.send({todo});
    } catch (e) {
        res.status(400).send();
    }
});

/******************** USER ROUTES ****************************/


// POST '/users' -> create new user
app.post('/users', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);       // 400 - Bad Request
    }
});

// GET '/users/me' -> return information about current user
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST '/users/login' {email, password} -> login with given credentials
app.post('/users/login', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    try {
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();     // 400 - Bad Request
    }
});

// DELETE /users/me/token -> logout current user by deleting his token
app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();       // 400 - Bad Request
    }
});

// start express application
app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};
let express = require('express');
let bodyParser = require('body-parser');
let {ObjectId} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

let app = express();
// define port variable to make possible heroku deployment
const port = process.env.PORT || 3000;

// configuring the middleware to parse request body into js object
app.use(bodyParser.json());

// define routes
app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
});

app.get('/todos', (req, res) => {
    Todo.find({}).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

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

app.delete('/todos/:id', (req, res) => {
  let id = req.params['id'];

  if (!ObjectId.isValid(id)) {
      return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then(todo => {
      if(!todo) {
          return res.status(404).send();
      }
      res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};
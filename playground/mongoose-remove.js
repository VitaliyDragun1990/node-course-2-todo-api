const {ObjectId} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then(result => {
//     console.log(result)
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({_id: '5a5c8b1e1bb50c64ab3b3030'}).then(todo => console.log(todo));

Todo.findByIdAndRemove('5a5c8b1e1bb50c64ab3b3030').then((todo) => {
    console.log(todo);
});
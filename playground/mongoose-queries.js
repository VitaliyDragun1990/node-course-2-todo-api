const {ObjectId} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// let id = '5a59ff5c96b33e701aaf3e76ff';
//
// if (!ObjectId.isValid(id)) {
//     console.log('ID not valid');
// }


// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });
//
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo By Id', todo);
// }).catch((e) => console.log(e));

let userId = '5a5a043e21498f5ebc9331db';
User.findById(userId).then((user) => {
   if (!user) {
       console.log('User not found');
   } else {
       console.log(JSON.stringify(user, undefined, 2));
   }
}).catch(e => console.log(e));
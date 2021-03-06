const {ObjectId} = require('mongodb');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

/*************** DEFINE SEED DATA FOR TEST PROPOSE ****************************/

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

const users = [{
    _id: userOneId,
    email: 'jack@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]

}];

const todos = [{
    _id: new ObjectId(),
    text: 'First test todo',
    _creator: userOneId
}, {
    _id: new ObjectId(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}];

const populateTodos =  (done) => {
    Todo.remove({}).then(() =>{
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
       let userOne = new User(users[0]).save();
       let userTwo = new User(users[1]).save();
       return Promise.all([userOne, userTwo]);
    }).then(()=> done());
};

module.exports = {todos, populateTodos, users, populateUsers};
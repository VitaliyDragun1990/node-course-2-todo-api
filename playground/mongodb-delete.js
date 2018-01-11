// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// Connect to mongo database
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server', err);
    }
    console.log('Connect to MongoDB server');

    // delete many documents
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
    //    console.log(result);
    // });

    // delete one document
    // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
    //    console.log(result);
    // });

    // delete one document and return it
    // db.collection('Todos').findOneAndDelete({completed: false}).then((document) => {
    //     console.log(document);
    // });

    // find all users with name Jack and delete them
    // db.collection('Users').deleteMany({name: 'Jack'}).then((result) => console.log(result));

    // find user by id, delete it, and return deleted value
    // db.collection('Users').findOneAndDelete({_id: new ObjectID('5a562698b5ac550690c3d209')})
    //     .then((user) => console.log(user));

    // db.close();
});
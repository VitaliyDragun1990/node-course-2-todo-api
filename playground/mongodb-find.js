// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// Connect to mongo database
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server', err);
    }
    console.log('Connect to MongoDB server');

    // fetch documents from todos collection
    // db.collection('Todos').find({
    //     _id: new ObjectID('5a5623b594751809a4ee3ca5')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });
    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });
    db.collection('Users').find({name: 'Jack'}).count().then((count) => {
        console.log(`Users with name Jack: ${count} user(s)`);
    }, (err) => {
        console.log('Unable to fetch users', err);
    });

    // db.close();
});
// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// Connect to mongo database
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server', err);
    }
    console.log('Connect to MongoDB server');

    // update the document in collection and get it back
    // db.collection('Todos').findOneAndUpdate({
    //         _id: new ObjectID('5a572c8f2a56c7c14f30d141')
    //     }, {
    //         $set: {
    //             completed: true
    //         }
    //     }, {
    //     returnOriginal: false
    // }).then((result) => console.log(result));

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5a56249207409b16e4c7a4eb')
    }, {
        $set :{
            name: 'Vitaly'
        },
        $inc: {
            age: 1
        }
    }, {
        returnOriginal: false
    }).then((result) => console.log(JSON.stringify(result.value, undefined, 2)));

    // db.close();
});
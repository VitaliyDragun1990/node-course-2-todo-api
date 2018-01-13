const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
   text: 'First test todo'
}, {
    text: 'Second test todo'
}];

beforeEach('Prepare database for out test propose', (done) => {
    Todo.remove({}).then(() =>{
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {

    it('should create a new todo', (done) => {
       let text = 'Test todo text';

       request(app)
           .post('/todos')      // make post request
           .send({text})        // send our text in a request body
           .expect(200)         // assert response code 200
           .expect((res) => {
               expect(res.body.text).toBe(text);    // assert response body contains our text
           })
           .end((err, res) => {
               if (err) {
                   return done(err);        // if error occurred - send it with done callback
               }

               Todo.find({text}).then((todos) => {        // retrieve all todos from the database
                   expect(todos.length).toBe(1);    // assert there is only one todo
                   expect(todos[0].text).toBe(text);    // assert that one todo has our text set
                   done();
               }).catch((e) => done(e));
           });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send()         // send empty body
            .expect(400)    // assert response code 400
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({}).then((todos) => {
                    expect(todos.length).toBe(2);   // assert that database contains only our dummy todos
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET /todos', () => {

    it('should get all todos', (done) => {
       request(app)
           .get('/todos')
           .expect(200)
           .expect((res) => {
               expect(res.body.todos.length).toBe(2);
           }).end(done);
    });
});
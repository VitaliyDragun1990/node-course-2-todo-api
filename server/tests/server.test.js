const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

beforeEach('Wipe out our todos collection in database', (done) => {
    Todo.remove({}).then(() => done());
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
               
               Todo.find().then((todos) => {        // retrieve all todos from the database
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
                    expect(todos.length).toBe(0);   // assert that no todo was created in database
                    done();
                }).catch(e => done(e));
            });
    });
});
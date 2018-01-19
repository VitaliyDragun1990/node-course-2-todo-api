const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach('Populate database with users',populateUsers);
beforeEach('Populate database with todos',populateTodos);

describe('POST /todos', () => {

    it('should create a new todo', (done) => {
       let text = 'Test todo text';

       request(app)
           .post('/todos')      // make post request
           .send({text})        // send our text in a request body
           .expect(200)         // assert response code 200
           .expect((res) => {
               expect(res.body.todo.text).toBe(text);    // assert response body contains our text
           })
           .end((err, res) => {
               if (err) {
                   return done(err);        // if error occurred - send it with done callback
               }

               Todo.find({text}).then((todos) => {        // find specific todo in the database
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

describe('GET /todos/:id', () => {

    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            }).end(done);
    });

    it('should return 404 if todo not found', (done) => {
        let validHexId = new ObjectId().toHexString();
        request(app)
            .get((`/todos/${validHexId}`))
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        let invalidId = 123;
        request(app)
            .get(`/todos/${invalidId}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {

    it('should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
               expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
               if (err) {
                   return done(err);
               }
               Todo.findById(hexId).then((todo) => {
                   expect(todo).toNotExist();
                   done();
               }).catch(e => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        let validHexId = new ObjectId().toHexString();
        request(app)
            .delete((`/todos/${validHexId}`))
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        let invalidId = 123;
        request(app)
            .delete(`/todos/${invalidId}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {

    it('should update the todo', (done) => {
       let hexId = todos[0]._id.toHexString();
       let updatedText = 'Updated text';

       request(app)
           .patch(`/todos/${hexId}`)
           .send({ text: updatedText, completed: true})
           .expect(200)
           .expect((res) => {
               expect(res.body.todo.text).toBe(updatedText);
               expect(res.body.todo.completed).toBe(true);
               expect(res.body.todo.completedAt).toBeA('number');
           }).end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        let hexId = todos[1]._id.toHexString();
        let updatedText = 'This is new text';

        request(app)
            .patch(`/todos/${hexId}`)
            .send({ text: updatedText, completed: false })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(updatedText);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            }).end(done);
    });
});

describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
               expect(res.body._id).toBe(users[0]._id.toHexString());
               expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 of not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            }).end(done)
    });
});

describe('POST /users', () => {
   
    it('should create a user', (done) => {
       let email = 'example@example.com';
       let password = '123mnb!';

       request(app)
           .post('/users')
           .send({email, password})
           .expect(200)
           .expect((res) => {
               expect(res.headers['x-auth']).toExist();
               expect(res.body._id).toExist();
               expect(res.body.email).toBe(email);
           }).end((err) => {
               if (err) {
                   return done(err);
               }

               User.findOne({email}).then((user) => {
                   expect(user).toExist();
                   expect(user.password).toNotBe(password);
                   done();
               })
       });
    });

    it('should return validation errors if request invalid', (done) => {
        let invalidEmail = 'example.com';
        let invalidPassword = '123ab';

        request(app)
            .post('/users')
            .send({invalidEmail, invalidPassword})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        let email = users[0].email;
        let password = '123456abc';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});
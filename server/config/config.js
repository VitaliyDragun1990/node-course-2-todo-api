// make this changes to have different databases for development and testing proposes
let env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
    process.env.PORT = 3000;
}

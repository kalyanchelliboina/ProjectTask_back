const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    company: String,
    password: String,
    firstName: String,
    lastName: String,
    fullName: String
})

const user = mongoose.model('user', userSchema, 'users')

module.exports = user;
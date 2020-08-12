const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: String,
    email: String,
    company: String
})

const project = mongoose.model('project', projectSchema, 'projects')

module.exports = project;
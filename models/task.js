const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    name: String,
    projectId: String,
    comments: [
        {
            comment : { type:String},
            commentator : { type:String},
            billableOrNonBillable: { type:String},
            timeLog: {type: String}
        }
    ],
    startDate : String,
    endDate : String,
    description : String,
    workHours : String,
    file: String,
    assigned: [{type: String}]
})

const task = mongoose.model('task', taskSchema, 'tasks')

module.exports = task;
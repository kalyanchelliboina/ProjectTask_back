const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');
const Project = require('../models/project');
const Task = require('../models/task')
const mongoose = require('mongoose');
const e = require('express');
const task = require('../models/task');

const db = "mongodb://localhost:27017/myProject";

mongoose.connect(db, (err) => {
    err => console.log(err)
    console.log('Connected to the database')
})

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization
    if (token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')
    if(!payload) {
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    console.log(req.user)
    next()
 }

 router.post('/', verifyToken, (req, res) => {
     const projectData = req.body;
    console.log(req.userId)
    User.findOne({ _id: req.userId }, (err, user) => {
        if(err) {
            console.log(err)
        } else {
            if(!user) {
                res.status.send('User not exists')
            } else {
                console.log(user)
                const savingData = {
                    email: user.email,
                    name: projectData.name,
                    company: user.company
                }
                console.log(savingData)
                const creatingProject = new Project(savingData);
                creatingProject.save((err, data) => {
                    err => {
                        console.log(err)
                    },
                    res.json(data)
                })
            }
        }
    })
        
    })


  router.get('/viewprojects', verifyToken, (req, res) => {
      User.findOne({ _id: req.userId }, (err, user) => {
          if(err) {
              console.log(err)
          } else {
              if(!user) {
                  res.status(401).send('Invalid user')
              } else {
                  Project.find({ company: user.company }).then((data) => {
                      res.send(data)
                  }).catch((err) => {
                      console.log(err)
                  })
              }
          }
      })
  })

  router.get('/viewproject/:id', verifyToken, (req,res) => {
      Project.find({ _id: req.params.id}).then((data) => {
          res.send(data)
      }).catch((err) => {
          console.log(err)
      })
      })

  
  router.get('/viewAllTasks/:projectId', verifyToken, (req, res) => {
      console.log(req.params.projectId)
      Task.find({ projectId: req.params.projectId }).then((data) => {
          console.log('here')
          res.send(data)
      }).catch((err) => {
          console.log(err)
      })
  })


 router.post('/createTask/:id', verifyToken, (req,res) => {
     const taskData = req.body;
    console.log(taskData)
     User.find({ _id: req.userId }, (err, user) => {
         if(err) {
             console.log('error')
             console.log(err);
         } else {
             if(!user) {
                 res.status(401).send('User not valid')
             } else {
                 console.log('here')
                 console.log(user)
                 const savingData = {
                     name: taskData.name,
                     projectId: req.params.id
                 }
                 console.log(savingData)
                 const creatingTask = new Task(savingData);
                 console.log(creatingTask)
                 creatingTask.save((err, data) => {
                     err => {
                         console.log(err)
                     },
                     res.json(data)
                 } )
             }
         }
     })
 })   



 router.get('/viewTask/:taskId', (req, res) => {
     Task.findOne({ 
         _id: req.params.taskId
     }).then((data) => {
         res.send(data)
     }).catch((err) => {
         console.log(err)
     })
 })


 router.post('/comment/:taskId', verifyToken,(req,res) => {
     console.log('he')
     Task.findOne({ _id: req.params.taskId }, (err, data) => {
         if(err) {
             res.send('here')
         } else {
             User.findOne({ _id: req.userId }, function (err, user) {
                 if(err) {
                     console.log('here too')
                 } else {
                     console.log(req.body)
                     console.log(user.email)
                     Task.findOneAndUpdate( { _id: req.params.taskId}, { $push: { comments: { comment: req.body.comment,
                    commentator: user.email, billableOrNonBillable: req.body.billOrNonbill, timeLog: req.body.timeLog}}}, function (error, success) {
                        if(error) {
                            console.log(error)
                        } else {
                            console.log('hereeeee')
                            console.log(success);
                            res.json(success)
                        }
                    })
                 }
             })
         }
     })
 })
  

router.patch('/updateTask/dateDescription/:taskId', verifyToken, (req, res) => {
    console.log(req.body)
    Task.findOneAndUpdate({ _id: req.params.taskId}, { $set: req.body }, (err, data) => {
        if(err) {
            console.log(err)
        } else {
            res.send(data)
        }
    })
})


 router.get('/', (err, res)=> {
     res.send('project get works')
 })



 

module.exports = router;
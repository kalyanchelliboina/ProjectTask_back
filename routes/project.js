const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');

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
                //  console.log(user)
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
                    //  console.log(req.body)
                    //  console.log(user.email)
                     Task.findOneAndUpdate( { _id: req.params.taskId}, { $push: { comments: { comment: req.body.comment,
                    commentator: user.fullName, billableOrNonBillable: req.body.billOrNonbill, timeLog: req.body.timeLog}}}, function (error, success) {
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


 const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `FunOfHeuristic_${file.originalname}`)
    }
  })
  
const upload = multer({ storage: storage })


router.post('/file/:taskId', upload.single('file'), (req, res, next) => {
    const file = req.file;
    // console.log(file.filename);
    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error)
      }
        console.log(file);
        Task.findOneAndUpdate({ _id: req.params.taskId }, { file: file.filename }, (err, data) => {
            if(err) {
                console.log(err)
            } else {
                // console.log(data)
                // console.log('success')
            }
        })
})


router.post('/assigned/:taskId', (req, res) => {
    // console.log(req.body)
    Task.findOneAndUpdate({ _id: req.params.taskId }, { $set: { assigned: req.body }}, (err, res) => {
        if(err) {
            console.log(err)
            console.log('error')
        } else {
            // console.log(res)
            console.log('data')
        }
    })
})


router.get('/userEmails', verifyToken, (req, res) => {
    console.log(req.body)
    console.log(req.userId)
   User.find({ _id: req.userId }, (err, user) => {
       if(err) {
           console.log(err)
       } else {
        //    console.log(user)
        //    console.log(user[0].company)
        
           User.find( { company: user[0].company }, (err, data) => {
               if (err) {
                   console.log(err)
               } else {
                //    console.log(data)
                   res.send(data)
               }
           })
       }
   })
})



router.post("/sendmail/:taskTitle/:projectName", verifyToken, (req, res) => {
    console.log("request came");
    // console.log(req.body)
    let user = req.body;
    // console.log(user[0])
    let taskTitle = req.params.taskTitle;
    let projectName = req.params.projectName;
    console.log('hey' + req.params.projectName)
    
    for (i=0; i< user.length; i++) {
        User.find({ fullName: user[i] }, (err, data) => {
            if(err) {
                console.log(err)
            } else {
               userEmailsData = data[0].email
                console.log(userEmailsData)
            }
            console.log(userEmailsData)
            sendMail(userEmailsData, info => {
                console.log(`The mail has beed send 😃 and the id is ${info.messageId}`);
                res.send(info);
              });
            
          
            
            async function sendMail(userEmailsData, callback) {
              // create reusable transporter object using the default SMTP transport
              let transporter = nodemailer.createTransport({
                host: "smtp.zoho.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: "sales@sanchitaa.com",
                  pass: "Sanchita#123"
                }
              });
            
              let mailOptions = {
                from: '"Sanchitaa Projects"<sales@sanchitaa.com>', // sender address
                to: userEmailsData, // list of receivers
                subject: " A new update on the task 👻", // Subject line
                html: `<h1>Hi </h1><br>
                <h4>There is a new update on the task "${taskTitle}" of project "${projectName}" </h4><br>
                <p>Please login to your projects portal</p><br>
                <ul><li>Go to the dashboard</li><br>
                <li>Select the project name "${projectName}"</li><br>
                <li>Within the project "${projectName}", select the task "${taskTitle}" to check the update</li></ul>`
              };
            
              // send mail with defined transport object
              let info = await transporter.sendMail(mailOptions);
            
              callback(info);
            }
            
        })
        
        
    }

  });

  
//   async function sendMail(user, callback) {
//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: co,
//         pass:
//       }
//     });
  
//     let mailOptions = {
//       from: '"Sanchitaa"<contact@sanchitaa.com>', // sender address
//       to: user.email, // list of receivers
//       subject: "Wellcome to Fun Of Heuristic 👻", // Subject line
//       html: `<h1>Hi ${user.name}</h1><br>
//       <h4>Thanks for joining us</h4>`
//     };
  
//     // send mail with defined transport object
//     let info = await transporter.sendMail(mailOptions);
  
//     callback(info);
//   }






module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')

const User = require('../models/user');
const mongoose = require('mongoose');

const db = "mongodb://localhost:27017/myProject";

mongoose.connect(db, (err) => {
    err => console.log(err)
    console.log('Connected to the database')
})

function verifyToken(req, res, next) {
    console.log(req.headers.authorization)
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
    next()
 }

router.get('/', verifyToken,(req,res) => {
    res.send('From api route');
})

router.get('/users', verifyToken, (req,res) => {
    User.find({}).then((data) => {
        res.json(data)
    })
})

router.post('/register', (req,res) => {
    let userData = req.body
    let str1 = req.body.firstName
    let str2 = req.body.lastName
     userData.fullName = str1 + " " + str2;
     console.log(userData.fullName)
     console.log(userData)
    let user = new User(userData)
    user.save((error, data) => {
        if(error) {
            console.log(error)
        } else {
            let payload = { subject: data._id }
            console.log(payload)
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token})
        }
    })
})


router.post('/login', (req,res) => {
    let userData = req.body;

    User.findOne({ email: req.body.email}, (err, user) => {
        if(err) {
            console.log(err);
        } else {
            if(!user) {
                res.status(401).send('Invalid email')
            } else {
                if(user.password !== userData.password) {
                    res.status(401).send('Invalid Password')
                } else {
                    let payload = { subject: user._id}
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({token})
                }
            }
        }
    })
})

module.exports = router
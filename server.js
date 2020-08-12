const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 3000

const api = require('./routes/api');
const project = require('./routes/project')
const app = express();

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', api);
app.use('/project', project)

app.get('/', (req,res) => {
    res.send('Hello from server')
})

app.listen(PORT, ()=> {
    console.log('Server is running on localhost:' + PORT);
})
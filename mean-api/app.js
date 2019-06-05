const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const Post = require('./models/posts');
const postRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization');
    if(req.method === 'OPTIONS') { 
        return res.sendStatus(200);
    }
    next();
}); 

app.use('/messages', postRoutes);
app.use('/user', userRoutes);

mongoose
  .connect(
    'mongodb+srv://testuser:testuser@cluster0-7spbm.mongodb.net/meanPosts?retryWrites=true'
  )
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => console.log(err));


const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res , next) => {
bcrypt.hash(req.body.password, 10)
.then(hashedPassword => {
    const user = new User({
        email: req.body.email,
        password: hashedPassword
    });
    return user.save();
})
.then(result => {
    res.status(201).json({message: 'User Created Successfully', result: result});
})
.catch(err => {
    res.status(500).json({
        message: 'Invalid Signup Credentials'
    });
 })
});

router.post('/login', (req, res , next) => {
let fetchedUser;
    User.findOne({email: req.body.email})
.then(user => {
    if(!user) {
        return res.status(401).json({message: 'Authentication Failed'});
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password);
})
.then(passCheck => {
    if(!passCheck) {
        return res.status(401).json({message: 'Authentication Failed'});
    }
    const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id}, 'dev_secret_string',
     {expiresIn: '2h'});
    res.status(200).json({token: token, expiresIn: 7200, userId: fetchedUser._id});
})
.catch(err => {
    return res.status(401).json({message: 'Invalid Authentication Credentials'});
})
});

module.exports = router;
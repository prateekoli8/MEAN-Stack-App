const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token , 'dev_secret_string');
        req.userData = { email: decodedToken.email, userId: decodedToken.userId };
        next();
    } catch(err) {
        res.status(401).json({message: "Unauthorized Access"});
    }
}
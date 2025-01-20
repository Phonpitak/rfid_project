const jwt = require('jsonwebtoken');
const secret = 'your_secret_key';

const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.body.token || req.query.token;

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;

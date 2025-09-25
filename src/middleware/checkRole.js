const jwt = require('jsonwebtoken');

const checkRole = (roles) => {
    return (req, res, next) => {
      
      if (roles.includes("guest")) {
        req.user = { role: "guest",
          username: "guest",
          id: "guest"
         };
        next();
      }

      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) return res.status(401).json({ message: 'No token provided' });
      jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
        if (err) {
          console.log(err);
          return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        console.log(decoded);
        if (roles.includes(decoded.role)) {
          req.user = decoded;
          next();
        } else {
          res.status(403).json({ message: 'Not authorized' });
        }
      });
    };
  };

module.exports = checkRole;
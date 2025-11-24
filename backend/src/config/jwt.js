const jwt = require('jsonwebtoken');
const environment = require('./environment');

if (!environment.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

if (!environment.JWT_EXPIRES_IN) {
  throw new Error('JWT_EXPIRES_IN is not defined in the environment variables.');
}

const jwtConfig = {
  secret: environment.JWT_SECRET,
  expiresIn: environment.JWT_EXPIRES_IN,

  generateToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  },
  
  verifyToken: (token) => {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token.');
      } else {
        throw new Error('Failed to verify token.');
      }
    }
  },
  
  decodeToken: (token) => {
    return jwt.decode(token);
  }
};

module.exports = jwtConfig;

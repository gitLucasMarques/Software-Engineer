const environment = require('./environment');

if (!environment.PORT) {
  throw new Error('PORT is not defined in the environment variables.');
}

if (!environment.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

const serverConfig = {
  port: environment.PORT,
  host: '0.0.0.0',
  
  express: {
    bodyLimit: '10mb',
    
    helmet: {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      xssFilter: true,
      hidePowereredBy: true,
    },

    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    },
 
    session: {
      secret: environment.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: environment.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      }
    }
  },
  
  logging: {
    level: environment.NODE_ENV === 'production' ? 'error' : 'debug',
    format: environment.NODE_ENV === 'production' ? 'combined' : 'dev'
  }
};

module.exports = serverConfig;

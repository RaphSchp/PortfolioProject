const session = require('express-session');

const sessionMiddleware = session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

module.exports = sessionMiddleware;
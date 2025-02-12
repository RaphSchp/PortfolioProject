const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sessionMiddleware = require('./middlewares/sessionMiddleware');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

app.use(bodyParser.json());
app.use(sessionMiddleware);

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Mount the routes
app.use(authRoutes);
app.use(eventRoutes);
app.use(userRoutes);
app.use('/', messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello, server is working!");
});

// Routes to serve JSON files from the data folder
app.get('/sports.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'sports.json'));
});
app.get('/cities.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'cities.json'));
});

module.exports = app;

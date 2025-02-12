const http = require('http');
const app = require('./app');
const socketIo = require('socket.io');
const setupSocketHandlers = require('./sockets/socketHandlers');
const sessionMiddleware = require('./middlewares/sessionMiddleware');
const chalk = require('chalk');
const mongoose = require('mongoose');

// Connexion at MongoDB
mongoose.connect('mongodb://localhost:27017/kangaroo')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

const server = http.createServer(app);
const io = socketIo(server);

setupSocketHandlers(io, sessionMiddleware);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(chalk.hex('#F77D2E')(`
    /\\ /\\__ _ _ __   __ _  __ _ _ __ ___   ___  
   / //_/ _\` | '_ \\ / _\` |/ _\` | '__/ _ \\ / _ \\ 
  / __ \\ (_| | | | | (_| | (_| | | | (_) | (_) |
  \\/  \\/\\__,_|_| |_|\\__, |\\__,_|_|  \\___/ \\___/ 
                    |___/                       
  `));
  console.log(`Server running on port ${PORT}`);
});
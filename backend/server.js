const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const socketIo = require('socket.io');
const userSockets = new Map();
const Conversation = require('./models/conversation');
const Message = require('./models/message');
const User = require('./models/user');
const Event = require('./models/event');

const app = express();
const PORT = 3000;

const server = http.createServer(app);
const io = socketIo(server); 

app.use(bodyParser.json());

// Configuration de la session
const sessionMiddleware = session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

// Associer le middleware de session à chaque connexion de socket
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});


// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/kangaroo');

// Function to validate an email address
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
// Définir la fonction getUserIdFromSession pour récupérer l'ID de l'utilisateur à partir de la session
  
  
app.get('/getLoggedInUserInfo', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Rechercher l'utilisateur dans la base de données
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Renvoyer les informations de l'utilisateur, y compris son ID
        res.json({ success: true, userId: req.session.userId, username: user.username, email: user.email, userpic: user.userpic });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


  

//////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/login', sessionMiddleware, async (req, res) => {
    try {
        console.log('User session ID (login):', req.sessionID);
        const { email, password } = req.body;
  
        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({ email, password });
  
        if (!user) {
            res.json({ success: false });
        } else {
            console.log('Stocker cet id dans la session:', user._id);
            // Stocker l'ID de l'utilisateur dans la session
            req.session.userId = user._id;
  
            // Répondre avec succès
            res.json({ success: true });
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  

// Route pour l'inscription
app.post('/register', sessionMiddleware, async (req, res) => {
    try {
        const { username, email, password, passwordConfirmation } = req.body;

        // Vérifier si les passwords ne sont pas identiques ou vides
        if (password !== passwordConfirmation || password === '') {
            return res.status(400).json({ success: false, message: 'Password and Password Confirmation do not match or are empty' });
        }

        // Vérifier si l'email est valide
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Email is not valid' });
        }

        // Vérifier si l'email est déjà utilisé
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Vérifier si l'username est déjà utilisé
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Créer un nouvel utilisateur avec les valeurs par défaut
        const newUser = new User({
            email,
            password,
            username, // Utilisez la valeur de regUsername pour le nom d'utilisateur
            userpic: 'lol.jpeg' // Définissez la valeur par défaut de l'image utilisateur
        });
        await newUser.save();
        

        // Envoyer un message de validation
        res.status(200).json({ success: true, message: 'Registration successful. Welcome! Please log in.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Route pour récupérer tous les événements depuis la base de données MongoDB
app.get('/events', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route pour se déconnecter
app.get('/logout', (req, res) => {
    // Détruire la session
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion :', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        // Rediriger vers une page de confirmation de déconnexion ou une autre page appropriée
        res.redirect('/login');
    });
});


// Route pour servir la page loginpage.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Route pour servir la page d'inscription
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Route pour servir le fichier sports.json
app.get('/sports.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'sports.json'));
});

// Route pour servir le fichier cities.json
app.get('/cities.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'cities.json'));
});

// Servez les fichiers statiques depuis le dossier 'frontend'
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Vous n'avez besoin que de cette ligne pour servir les fichiers statiques
// Assurez-vous que le chemin est correct
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));



// Démarrage du serveur
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});




// Route to filter events by sport
app.get('/events/sport/:sport', async (req, res) => {
    try {
        const sport = req.params.sport;
        const events = await Event.find({ sport });
        res.json(events);
    } catch (error) {
        console.error('Error filtering events by sport:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// server.js


// Fonction pour récupérer l'ID de l'utilisateur à partir de la session
function getUserIdFromSession(req) {
    // Vérifier si l'utilisateur est connecté et si oui, renvoyez son ID
    if (req.session && req.session.userId) 
    {console.log(`Je suis connecté`);
        return req.session.userId;
    } else {
        console.log(`Je retourne null`);
        return null;
    }
}



// Handle user fetching
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '_id username');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Lorsqu'un utilisateur se connecte, associez son ID utilisateur à son socket
    const userId = getUserIdFromSession(socket.request);
    if (userId) {
        userSockets.set(userId, socket);
    }


// Gestion de l'événement 'private message'
socket.on('private message', async (msg) => {
    try {
        if (!socket.request || !socket.request.session) {
            console.error('Error: Socket request or session not available');
            return;
        }
        
        const senderId = getUserIdFromSession(socket.request); // Récupérez l'ID de l'expéditeur à partir de la session
        if (!senderId) {
            console.error('Error: User not authenticated');
            return;
        }
        
        // Logique de traitement des messages privés ici
        const recipientId = msg.recipientId; // L'ID du destinataire provient des données du message
        const content = msg.content; // Le contenu du message
        
        // Recherchez une conversation existante entre l'expéditeur et le destinataire
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        // Si aucune conversation n'existe, créez une nouvelle conversation
        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId]
            });
            await conversation.save();
        }

        // Créez un nouveau message à enregistrer dans la base de données
        const newMessage = new Message({
            conversationId: conversation._id, // Associez le message à la conversation
            senderId: senderId,
            recipientId: recipientId,
            content: content
        });

        // Enregistrez le nouveau message dans la base de données
        await newMessage.save(); // Assurez-vous que le message est enregistré dans la base de données

        // Trouver le socket du destinataire à partir de son ID
        const recipientSocket = userSockets.get(recipientId);
        if (recipientSocket) {
            // Envoyer le message au socket du destinataire
            recipientSocket.emit('private message', {
                senderId: senderId,
                content: content
            });
        } else {
            console.error('Error: Recipient socket not found');
        }
    } catch (error) {
        console.error('Error saving private message:', error);
    }
});




    
// Gestion de la déconnexion de l'utilisateur
socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Supprimez l'entrée correspondante dans la structure de données
    userSockets.forEach((value, key) => {
        if (value === socket) {
            userSockets.delete(key);
        }
    });
});
});


app.get('/messages/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;

      // Si userId est indéfini, renvoyer un message indiquant que l'ID de l'utilisateur est indéfini
      if (!userId) {
        console.log('User ID is undefined. Skipping error.');
        return res.status(200).json({ success: true, message: 'User ID is undefined' });
      }

      // Find the conversation with the given user ID
      const conversation = await Conversation.findOne({
        participants: { $all: [req.session.userId, userId] }
      });

      // Si la conversation n'est pas trouvée, renvoyer un message indiquant que la conversation n'a pas été trouvée
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
      
      // Fetch messages for the conversation
      const messages = await Message.find({ conversationId: conversation._id });
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });


const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const socketIo = require('socket.io'); // Importez socket.io avant de l'utiliser
const userSockets = new Map();
const cors=require("cors")

const app = express();
const PORT = 3000;

const server = http.createServer(app);
const io = socketIo(server); // Utilisez socket.io après son importation

// Le reste de votre code ici...


app.use(bodyParser.json());

app.use(cors())

// Configuration de la session
const sessionMiddleware = session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

// Associez le middleware de session à chaque connexion de socket
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});


// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://bennorft:bennorft@cluster0.dyuhtxw.mongodb.net/eventsdata?retryWrites=true&w=majority&appName=Cluster0');

// Définition du schéma de l'user
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    userpic: { type: String, default: 'lol.jpeg' }
});

// Création du modèle user
const User = mongoose.model('User', userSchema);

// Définition du schéma de l'event
const eventSchema = new mongoose.Schema({
    event_name: { type: String, required: true },
    img: { type: String, required: true },
    sport: { type: String, required: true },
    doc: { type: String, required: true },
    event_hour: { type: String, required: true },
    event_date: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    participants: { type: String, required: true },
    publication_date: { type: String, required: true },
});

// Création du modèle event
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

// Function to validate an email address
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}



app.get("/random", async (req,res) => {
    res.json({ message: "You are at good place" })
})


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Définissez la fonction getUserIdFromSession pour récupérer l'ID de l'utilisateur à partir de la session
// Définissez la fonction getUserIdFromSession pour récupérer l'ID de l'utilisateur à partir de la session


app.post("/events",async(req,res)=>{
    try {
        const newEvent=Event(req.body)
        await newEvent.save()
        res.status(201).json({message:"Event Created Succesfully",succes:true})
    } catch (error) {
        res.status(400).json({message:error.message,success:false})
    }
})
  
  
  // Route pour récupérer les informations de l'utilisateur connecté
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
  
          // Renvoyer les informations de l'utilisateur
          res.json({ success: true, username: user.username, email: user.email, userpic: user.userpic });
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
app.get('/events',sessionMiddleware, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        // if (!req.session.userId) {
        //     return res.status(401).json({ success: false, message: 'Unauthorized' });
        // }

        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route pour se déconnecter
app.post('/logout', (req, res) => {
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
    // Vérifiez si l'utilisateur est connecté et si oui, renvoyez son ID
    if (req.session && req.session.userId) {
        return req.session.userId;
    } else {
        return null;
    }
}

const Conversation = require('./models/conversation');
const Message = require('./models/message');

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
        
        // Créez un nouveau message à enregistrer dans la base de données
        const newMessage = new Message({
            senderId: senderId,
            recipientId: recipientId,
            content: content
        });

        // Enregistrez le nouveau message dans la base de données
        await newMessage.save();

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
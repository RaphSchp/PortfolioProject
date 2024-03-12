const http = require('http');
const express = require('express');
const multer = require('multer');
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
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Rechercher l'utilisateur dans la base de données
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Renvoyer les informations de l'utilisateur, y compris son ID
        res.json({
            success: true,
            userId: req.session.userId,
            username: user.username,
            email: user.email,
            userpic: user.userpic
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});




//////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/login', sessionMiddleware, async (req, res) => {
    try {
        console.log('User session ID (login):', req.sessionID);
        const {
            email,
            password
        } = req.body;

        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({
            email,
            password
        });

        if (!user) {
            res.json({
                success: false
            });
        } else {
            console.log('Stocker cet id dans la session:', user._id);
            // Stocker l'ID de l'utilisateur dans la session
            req.session.userId = user._id;

            // Répondre avec succès
            res.json({
                success: true
            });
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});


// Route pour l'inscription
app.post('/register', sessionMiddleware, async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            passwordConfirmation
        } = req.body;

        // Check if password are matching or empty
        if (password !== passwordConfirmation || password === '') {
            return res.status(400).json({
                success: false,
                message: 'Password and Password Confirmation do not match or are empty'
            });
        }

        // Check if email is in valid format
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email is not valid'
            });
        }

        // Check if email is already attribute
        const existingEmail = await User.findOne({
            email
        });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Check if username is already attribute
        const existingUsername = await User.findOne({
            username
        });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create a new user
        const newUser = new User({
            email,
            password,
            username,
            userpic: 'lol.jpeg'
        });
        await newUser.save();


        // Send a welcome message
        res.status(200).json({
            success: true,
            message: 'Registration successful. Welcome! Please log in.'
        });
        // Else a error message
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

// Define destination folder of the downloaded images
const destinationFolder = path.join(__dirname, '../frontend/assets/user_image');

// Configuration of Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        // Check if the User is connected and his ID available
        if (req.session.userId) {
            // Use User's ID in filename with timestamp
            const ext = path.extname(file.originalname);
            const userId = req.session.userId;
            const timestamp = Date.now();
            const filename = `${userId}_${timestamp}${ext}`;
            cb(null, filename);
        } else {

            cb(new Error("User not logged in"));
        }
    }
});


// Initialisation de Multer avec la configuration
const upload = multer({ storage: storage });

// Route pour gérer le téléversement d'image
app.post('/upload', upload.single('eventImage'), (req, res) => {
    console.log("Received POST request to /upload");

    // Vérifier si un fichier a été correctement téléversé
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Si un fichier a été téléversé, afficher les informations sur le fichier
    console.log("Received file:", req.file);

    // Répondre avec un message de succès et le nom du fichier téléversé
    res.status(200).json({ success: true, message: 'File uploaded successfully', filename: req.file.filename });
});




  
  
  

// Route pour l'inscription d'event
app.post('/registerevent', sessionMiddleware, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Récupérer l'utilisateur actuellement connecté à partir de la session
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const {
            event_name,
            img,
            sport,
            doc,
            event_hour,
            event_date,
            city,
            address,
            participants,
            publication_date,
            status,
        } = req.body;

        // Check if event name is already given
        const existingEventName = await Event.findOne({ event_name });
        if (existingEventName) {
            return res.status(400).json({
                success: false,
                message: 'Event name already exists'
            });
        }

        if (
            event_name === '' ||
            sport === '' ||
            doc === '' ||
            event_hour === '' ||
            event_date === '' ||
            city === '' ||
            address === '' ||
            participants === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all the fields'
            });
        }
        

        // Create a new event
        const newEvent = new Event({
            event_name,
            userpic: currentUser.userpic,
            img,
            sport,
            doc,
            event_hour,
            event_date,
            city,
            address,
            participants,
            publication_date,
            status,
            createdBy: currentUser._id
        });
        await newEvent.save();

        // Envoyer un message de validation
        res.status(200).json({
            success: true,
            message: 'Event posted successfully!'
        });
    } catch (error) {
        console.error('Error during posting event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});


// Route pour récupérer tous les événements depuis la base de données MongoDB
app.get('/events', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// Route pour se déconnecter
app.get('/logout', (req, res) => {
    // Détruire la session
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion :', err);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
        // Rediriger vers une page de confirmation de déconnexion ou une autre page appropriée
        res.redirect('/login');
    });
});


// Route pour servir la page loginpage.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Route pour servir la page d'inscription
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'frontend', 'public', 'pages', 'loginpage.html'));
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
        const events = await Event.find({
            sport
        });
        res.json(events);
    } catch (error) {
        console.error('Error filtering events by sport:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// server.js


// Fonction pour récupérer l'ID de l'utilisateur à partir de la session
function getUserIdFromSession(req) {
    // Vérifier si l'utilisateur est connecté et si oui, renvoyez son ID
    if (req.session && req.session.userId) {
        console.log(`Je suis connecté`);
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
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
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
                participants: {
                    $all: [senderId, recipientId]
                }
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
                conversationId: conversation._id,
                senderId: senderId,
                recipientId: recipientId,
                content: content
            });

            // Save new message in data base
            await newMessage.save();

            // Find recipient socket with his ID
            const recipientSocket = userSockets.get(recipientId);
            if (recipientSocket) {
                // Send a message to recipient socket
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




    // Handle disconection of the user
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Delete correspond enter in data structure
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

        // If userId isn't found send a message to tell 'User ID is undefined'
        if (!userId) {
            console.log('User ID is undefined. Skipping error.');
            return res.status(200).json({
                success: true,
                message: 'User ID is undefined'
            });
        }

        // Find the conversation with the given user ID
        const conversation = await Conversation.findOne({
            participants: {
                $all: [req.session.userId, userId]
            }
        });

        // If conversation isn't found send a message to tell 'Conversation not found'
        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        // Fetch messages for the conversation
        const messages = await Message.find({
            conversationId: conversation._id
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});
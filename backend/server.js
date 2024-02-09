const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/kangaroo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Définition du schéma de l'utilisateur
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    userpic: { type: String, default: 'lol.jpeg' }
});

// Définition du schéma de l'event
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    doc: { type: String, required: true },
    event_hour: { type: String, required: true },
    event_date: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    participants: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

// Création du modèle utilisateur
const User = mongoose.model('User', userSchema);

// Function to validate an email address
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Route pour la connexion
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({ email, password });

        if (!user) {
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route pour l'inscription
app.post('/register', async (req, res) => {
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
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route pour servir la page loginpage.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Route pour servir la page d'inscription
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Servez les fichiers statiques depuis le dossier 'frontend'
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Vous n'avez besoin que de cette ligne pour servir les fichiers statiques
// Assurez-vous que le chemin est correct
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Route pour gérer toutes les autres requêtes et rediriger vers 'public/pages/mainpage.html'
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

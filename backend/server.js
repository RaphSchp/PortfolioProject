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
    email: String,
    password: String,
});

// Création du modèle utilisateur
const User = mongoose.model('User', userSchema);

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


// Route pour servir la page loginpage.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Servez les fichiers statiques depuis le dossier 'frontend'
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Vous n'avez besoin que de cette ligne pour servir les fichiers statiques
// Assurez-vous que le chemin est correct
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// ... le reste de votre configuration ...



// Route pour gérer toutes les autres requêtes et rediriger vers 'public/pages/mainpage.html'
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,"..", 'frontend', 'public', 'pages', 'mainpage.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

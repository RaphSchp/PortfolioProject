// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const config = require('config');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(
    session({
        secret: config.sessionSecret,
        resave: true,
        saveUninitialized: true,
    })
);


const path = require('path');

app.get('/test', (req, res) => {
    // Chemin absolu du répertoire des vues
    const viewsDirectory = path.join(__dirname, 'views');

    // Afficher le contenu du répertoire des vues
    res.send(`Contenu du répertoire des vues : ${viewsDirectory}`);
});



// Routes pour l'authentification
app.get('/', (req, res) => {
    res.render('login'); // Utilisez le fichier EJS pour le formulaire de connexion
});

app.get('/register', (req, res) => {
    res.render('signup'); // Utilisez le fichier EJS pour le formulaire d'inscription
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        res.redirect('/');
    } catch (error) {
        res.render('signup', { error: 'Erreur lors de l\'inscription' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = user;
            res.redirect('/dashboard'); // Rediriger vers votre tableau de bord après la connexion réussie
        } else {
            res.render('login', { error: 'Identifiants incorrects' });
        }
    } catch (error) {
        res.render('login', { error: 'Identifiants incorrects' });
    }
});

// Ajoutez cette accolade manquante
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

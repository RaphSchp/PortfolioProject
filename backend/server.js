const express = require('express');
const path = require('path');

const app = express();
const port = 8000;

// Joindre le chemin du répertoire 'public' dans le frontend
const publicPath = path.join(__dirname, '../../frontend/public');

// Utiliser express.static avec le chemin ajusté
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.send('Bienvenue sur votre serveur Express.');
});

app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});

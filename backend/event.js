const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Définir le schéma pour les événements ici
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;


// Route pour créer un nouvel événement
app.post('/events/create', async (req, res) => {
    try {
        // Récupérer les données de l'événement à partir du corps de la requête
        const eventData = req.body;

        // Créer un nouvel objet Event avec les données reçues
        const newEvent = new Event(eventData);

        // Enregistrer le nouvel événement dans la base de données
        await newEvent.save();

        // Retourner une réponse de succès
        res.status(201).json({ success: true, message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

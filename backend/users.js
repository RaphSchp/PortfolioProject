const mongoose = require('mongoose');

// Connexion à la base de données MongoDBs
mongoose.connect('mongodb://localhost:27017/kangaroo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    userpic: String,
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

   < !--Event Creation Box-- >
    <div id="createEventBox" class="event-box">
        <h2>Create Event</h2>
        <a href="#" class="close-btn" onclick="closeEventBox()">&times;</a>
        <form id="eventForm">
            <ul>
                <li>
                    <label for="eventName">Event Name:</label>
                    <input type="text" id="eventName" name="eventName" required>
                </li>
                <li>
                    <label for="eventSport">Sport:</label>
                    <input id="eventSport" name="eventSport" list="sportsList" required>
                        <datalist id="sportsList">
                            <!-- Options seront ajoutées dynamiquement par JavaScript -->
                        </datalist>
                </li>
                <li>
                    <label for="eventDescription">Event Description:</label>
                    <textarea id="eventDescription" name="eventDescription" required></textarea>
                </li>
                <li>
                    <label for="eventTime">Event Time:</label>
                    <input type="text" id="eventTime" name="eventTime" required>
                </li>
                <li>
                    <label for="eventDate">Event Date:</label>
                    <input type="date" id="eventDate" name="eventDate" required>
                </li>
                <li>
                    <label for="eventCity">Event City:</label>
                    <input type="text" id="eventCity" name="eventCity" required>
                </li>
                <li>
                    <label for="eventAddress">Event Adress:</label>
                    <input type="text" id="eventAddress" name="eventAddress" required>
                </li>
                <li>
                    <label for="participants">Participants:</label>
                    <input type="number" id="participants" name="participants" required>
                </li>
                <li>
                    <label for="eventLocation">Event Location:</label>
                    <input type="text" id="eventLocation" name="eventLocation" required>
                </li>
                <li>
                    <label for="eventImage">Event Image:</label>
                    <input type="file" id="eventImage" name="eventImage" accept="image/*" required>
                </li>
                <li>
                    <p>On demand / Open</p>
                    <label class="switch">
                        <input type="checkbox">
                            <span class="slider round"></span>
                    </label>
                </li>
            </ul>
            <button type="button" onclick="submitEvent()">Create Event</button>
        </form>
    </div>
    </div >


    // CREATE EVENT BOX -------------------------------------------------------------------------------------------------------------------------------

    document.addEventListener("DOMContentLoaded", () => {
        const createEventLinks = document.querySelectorAll('.create-event-link');
        const modalBackground = document.getElementById('modalBackground');

        // Hide modal background by default
        modalBackground.style.display = 'none';

        createEventLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                modalBackground.style.display = 'flex';
            });
        });
    });

function closeEventBox() {
    document.getElementById('modalBackground').style.display = 'none';


    // Fonction pour gérer l'inscription
    function handleRegistration() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const passwordConfirmation = document.getElementById('regPasswordConfirmation').value;

        // Vérifier si les passwords ne sont pas identiques ou vides
        if (password !== passwordConfirmation || password === '') {
            alert('Password and Password Confirmation do not match or are empty.');
            return;
        }

        // Vérifier si l'email est valide
        if (!validateEmail(email)) {
            alert('Email is not valid.');
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password, passwordConfirmation }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Afficher un message de validation
                    alert(data.message);
                    // Rediriger l'utilisateur vers la page de connexion
                    window.location.href = '/login';
                } else {
                    // Afficher un message d'erreur
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert('An error occurred. Please try again later.');
            });
    }

    // Fonction pour valider un email
    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const registerButton = document.querySelector('.input-submit-register');
        const boxRegisterInput = document.querySelector('.box-register');

        if (registerButton) {
            registerButton.addEventListener('click', handleRegistration);
        }

        if (boxRegisterInput) {
            boxRegisterInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    handleRegistration();
                }
            });
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


            // Envoyer un message de validations
            res.status(200).json({ success: true, message: 'Registration successful. Welcome! Please log in.' });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });


    app.post('/create-event', async (req, res) => {
        try {
            const { eventName, eventSport, eventDescription, eventTime, eventDate, eventCity, eventAddress, participants, eventLocation, eventImage } = req.body;

            // Créez votre logique de validation des données ici

            // Créez un nouvel événement avec les valeurs fournies
            const newEvent = new Event({
                eventName,
                eventSport,
                eventDescription,
                eventTime,
                eventDate,
                eventCity,
                eventAddress,
                participants,
                eventLocation,
                eventImage
            });
            await newEvent.save();

            // Envoyer une réponse réussie
            res.status(200).json({ success: true, message: 'Event created successfully.' });
        } catch (error) {
            console.error('Error during event creation:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });

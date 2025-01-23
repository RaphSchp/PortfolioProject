const http = require('http');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const PasswordValidator = require('password-validator');
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
const Participant = require('./models/participant');
const schema = new PasswordValidator();
schema
    .is().min(8)           // Minimum length of 8 characters
    .is().max(50)          // Maximum length of 50 characters
    .has().uppercase()     // Must contain at least one uppercase letter
    .has().lowercase()     // Must contain at least one lowercase letter
    .has().digits()        // Must contain at least one digit
    .has().symbols()       // Must contain at least one special character
    .has().not().spaces(); // Must not contain spaces


const app = express();
const PORT = 3000;

const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());

// Session configuration
const sessionMiddleware = session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

// Associate session middleware with each socket connection
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});


// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/kangaroo');

// Function to validate an email address
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

app.get('/getLoggedInUserInfo', async (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Find the user in the database
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return user information including their ID
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

app.post('/login', sessionMiddleware, async (req, res) => {
    try {
        console.log('User session ID (login):', req.sessionID);
        const { email, password } = req.body;

        // Find the user in the database by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        console.log('Storing this id in session:', user._id);

        // Store user ID in session
        req.session.userId = user._id;

        // Respond successfully
        res.json({
            success: true,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});



// Route for registration
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

        // Check if the password is strong
        if (!schema.validate(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character',
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

         // Hash the password
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            userpic: 'lol.jpeg'
        });
        try {
            await newUser.save();
            console.log('User saved successfully');
        } catch (err) {
            console.error('Error saving user:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to save user',
            });
        }
        


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
    destination: function(req, file, cb) {
        cb(null, destinationFolder);
    },
    filename: function(req, file, cb) {
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


// Initialize Multer with configuration
const upload = multer({
    storage: storage
});

// Route to handle image upload
app.post('/upload', upload.single('eventImage'), (req, res) => {
    console.log("Received POST request to /upload");

    // Check if a file was successfully uploaded
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    // If a file was uploaded, log file information
    console.log("Received file:", req.file);

    // Respond with a success message and the uploaded file name
    res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        filename: req.file.filename
    });
});



// Route for event registration
app.post('/registerevent', sessionMiddleware, async (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Get the currently logged-in user from the session
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
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
        const existingEventName = await Event.findOne({
            event_name
        });
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

        // Send a validation message
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


// Route to retrieve all events from MongoDB database
app.get('/events', async (req, res) => {
    try {
        // Check if the user is logged in
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


app.post('/participate/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const userId = getUserIdFromSession(req); // Get user ID from session

    try {
        // Find the event in the database
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).send('Événement non trouvé.');
        }

        // Check if the event is open or on request
        if (event.status === 'Open') {
            // Check if the user is already participating in this event
            const existingParticipant = await Participant.findOne({
                eventId,
                participantIds: userId
            });
            if (existingParticipant) {
                return res.status(200).send('You are already participating in this event.');
            }

            // Create a new participant and add it to the Participant collection
            let participant = await Participant.findOne({
                eventId
            });
            if (!participant) {
                participant = new Participant({
                    eventId,
                    participantIds: [userId]
                });
            } else {
                participant.participantIds.push(userId);
            }
            await participant.save();

            return res.status(200).send('Participation successful.');
        } else if (event.status === 'Demand') {
            // Create a participation request associated with the event creator
            const participantRequest = {
                userId: userId,
                message: 'Participation request',
                status: 'Pending'
            };
            event.participantRequests.push(participantRequest);
            await event.save();
            return res.status(200).json({
                success: true,
                message: 'Participation request sent.'
            });

        } else {
            // If the event status is neither "open" nor "demand", return an error message
            return res.status(400).send('Invalid event status.');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error participating in event.');
    }
});


// Route to retrieve participation requests of an event
app.get('/getParticipantRequests/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        // Find the event in the database
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Return participation requests of the event
        res.json({
            success: true,
            participantRequests: event.participantRequests
        });
    } catch (error) {
        console.error('Error fetching participant requests:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

// Route to accept or reject a participation request
app.post('/handleParticipantRequest/:eventId/:userId/:action', async (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    const action = req.params.action;

    try {
        console.log('Route /handleParticipantRequest reached.');
        console.log('Event ID:', eventId);
        console.log('User ID:', userId);
        console.log('Action:', action);
        // Find the event in the database
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        console.log('Event before update:', event);

        // Find the participation request in the event
        const requestIndex = event.participantRequests.findIndex(request => request.userId.equals(userId)); // Compare IDs using equals method
        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Participant request not found'
            });
        }

        console.log('Participant request before update:', event.participantRequests[requestIndex]);

        // Update the request status based on the action
        if (action === 'accept') {
            event.participantRequests[requestIndex].status = 'Accepted';

            // Check if an entry for this event already exists in the participants collection
            let participantEntry = await Participant.findOne({
                eventId: eventId
            });
            if (participantEntry) {
                // Update the participantIds list
                participantEntry.participantIds.push(userId);
            } else {
                // Create a new entry for this event
                participantEntry = new Participant({
                    eventId: eventId,
                    participantIds: [userId]
                });
            }
            await participantEntry.save();
        } else if (action === 'reject') {
            event.participantRequests[requestIndex].status = 'Rejected';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }

        // Save event modifications to the database
        await event.save();

        console.log('Event after update:', event);

        res.json({
            success: true,
            message: `Participant request ${action}ed successfully`
        });
    } catch (error) {
        console.error('Error handling participant request:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});




// Route to retrieve the ID of the event creator
app.get('/getEventCreatorId/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;

        // Find the event in the database
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Get the ID of the event creator
        const creatorId = event.createdBy;

        // Find the user corresponding to the creator ID
        const user = await User.findById(creatorId, 'username');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found'
            });
        }

        // Return the ID and username of the event creator
        res.json({
            success: true,
            creatorId: creatorId,
            creatorUsername: user.username
        });
    } catch (error) {
        console.error('Error fetching event creator ID:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});;




// Route for logout
app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
        // Redirect to a login page
        res.redirect('/login');
    });
});


// Route to serve loginpage.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Route to serve the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'frontend', 'public', 'pages', 'loginpage.html'));
});

// Route to serve sports.json file
app.get('/sports.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'sports.json'));
});

// Route to serve cities.json file
app.get('/cities.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'cities.json'));
});

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Route to serve other static files
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));



// Start the server
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



// Function to get user ID from session
function getUserIdFromSession(req) {
    // Check if the user is logged in and if yes, return their ID
    if (req.session && req.session.userId) {
        console.log(`I'm logged in`);
        return req.session.userId;
    } else {
        console.log(`I return null`);
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

    // When a user connects, associate their user ID with their socket
    const userId = getUserIdFromSession(socket.request);
    if (userId) {
        userSockets.set(userId, socket);
    }


    // Handling the 'private message' event
    socket.on('private message', async (msg) => {
        try {
            if (!socket.request || !socket.request.session) {
                console.error('Error: Socket request or session not available');
                return;
            }

            const senderId = getUserIdFromSession(socket.request); // Get sender ID from session
            if (!senderId) {
                console.error('Error: User not authenticated');
                return;
            }

            // Handling private messages
            const recipientId = msg.recipientId; // Recipient ID comes from message data
            const content = msg.content; // Message content

            // Search for an existing conversation between sender and recipient
            let conversation = await Conversation.findOne({
                participants: {
                    $all: [senderId, recipientId]
                }
            });

            // If no conversation exists, create a new conversation
            if (!conversation) {
                conversation = new Conversation({
                    participants: [senderId, recipientId]
                });
                await conversation.save();
            }

            // Create a new message to save in the database
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
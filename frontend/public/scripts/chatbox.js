// CHAT BOX -------------------------------------------------------------------------------------------------------------------------------------------------------------

let selectedUserId = null;

async function getUserIdFromSession() {
    try {
        const response = await fetch('/getLoggedInUserInfo');
        const data = await response.json();

        if (data.success && data.userId) {
            console.log(`User ID : ${data.userId}`);
            return data.userId;
        } else {
            console.error('User ID not found in session or response is not successful.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user ID from session:', error);
        return null;
    }
}


function closeChatBox() {
    document.getElementById('modalBackgroundChat').style.display = 'none';
}

// Scroll to bottom of chat messages
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour ajouter un message au chat
function appendMessageToChat(message, isSentByCurrentUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');

    // Appliquer les classes CSS appropriées en fonction de qui envoie le message
    if (isSentByCurrentUser) {
        messageElement.classList.add('message-sent');
        console.log('Using message-sent');
    } else {
        messageElement.classList.add('message-received');
        console.log('Using message-received');
    }

    messageElement.innerHTML = message;
    chatMessages.appendChild(messageElement);
}

// Function to clear chat messages
function clearChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
}

// Function to retrieve messages from the conversation with a specific user
async function fetchMessagesForUser(userId) {
    try {
        if (!userId) {
            console.log('User ID is undefined. Skipping message fetching.');
            return [];
        }

        console.log('Fetching messages for user:', userId);

        const response = await fetch(`/messages/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const messages = await response.json();
        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

// Function to display messages in the chat
async function renderMessages(messages) {
    try {
        const userId = await getUserIdFromSession();
        const chatMessages = document.getElementById('chatMessages');
        console.log('Rendering messages:', messages);

        if (messages.length === 0) {
            console.log('No messages to render. Clearing chat messages.');
            clearChatMessages();
        }

        messages.forEach(message => {
            const isSentByCurrentUser = (message.senderId === userId);
            console.log('Sender ID:', message.senderId);
            console.log('Recipient ID:', message.recipientId);
            console.log('Current User ID:', userId);
            console.log('Is Sent By Current User:', isSentByCurrentUser);
            appendMessageToChat(message.content, isSentByCurrentUser);
            scrollToBottom();
        });
    } catch (error) {
        console.error('Error rendering messages:', error);
    }
}

// Function to load messages for the selected user
async function loadMessagesForSelectedUser() {
    try {
        const userId = await getUserIdFromSession();

        if (selectedUserId) {
            console.log('Loading messages for selected user:', selectedUserId);
            const messages = await fetchMessagesForUser(selectedUserId);
            clearChatMessages();
            renderMessages(messages, userId);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Function to render the user list
function renderUserList(filterText = '') {
    fetch('/users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(users => {
            const userListContainer = document.getElementById('userList');
            const chatInput = document.getElementById('userSearchInput');
            userListContainer.innerHTML = '';

            let count = 0;

            if (filterText.trim() === '') {
                return;
            }

            if (selectedUserId) {
                const selectedUser = users.find(user => user._id === selectedUserId);
                if (selectedUser) {
                    const userElement = document.createElement('div');
                    userElement.textContent = selectedUser.username;
                    userElement.classList.add('user-selected');
                    chatInput.style.display = 'none';
                    userElement.dataset.userId = selectedUser._id;


                    userElement.addEventListener('click', async () => {
                        selectedUserId = null;
                        console.log("Selected User ID:", selectedUserId);
                        userElement.classList.remove('user-selected');
                        chatInput.style.display = 'flex';
                        renderUserList(filterText);
                        clearChatMessages();
                    });

                    userListContainer.appendChild(userElement);
                }
            } else {
                users.forEach(user => {
                    if (count >= 4) return;

                    if (user.username.toLowerCase().includes(filterText.toLowerCase())) {
                        const userElement = document.createElement('div');
                        userElement.textContent = user.username;
                        userElement.dataset.userId = user._id;

                        userElement.addEventListener('click', async () => {
                            selectedUserId = user._id;
                            console.log("Selected User ID:", selectedUserId);
                            userElement.classList.add('user-selected');
                            await loadMessagesForSelectedUser();
                            renderUserList(filterText);
                        });

                        userElement.addEventListener('mouseover', () => {
                            if (userElement.classList.contains('user-selected')) {
                                userElement.classList.add('user-selected-hover');
                            }
                        });

                        userElement.addEventListener('mouseout', () => {
                            userElement.classList.remove('user-selected-hover');
                        });

                        userListContainer.appendChild(userElement);
                        count++;
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

let socket;

document.addEventListener("DOMContentLoaded", () => {
    const modalBackgroundChat = document.getElementById('modalBackgroundChat');



    // Hide modal background by default
    modalBackgroundChat.style.display = 'none';

    // Handle the event to display the chat box when clicking on a message link
    document.querySelectorAll('.message').forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            console.log('Clicked on message link.');
            modalBackgroundChat.style.display = 'flex';
            selectedUserId = link.dataset.userId;
            console.log("Selected User ID:", selectedUserId);
            if (selectedUserId) {
                const messages = await fetchMessagesForUser(selectedUserId);
                renderMessages(messages);
                await loadMessagesForSelectedUser();
            } else {
                console.log('Selected user ID is undefined. Skipping message fetching.');
            }
        });
    });

    // Connect to the Socket.IO server
    socket = io();
    const chatForm = document.getElementById('chatForm');

    // Handle the chat form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message !== '' && selectedUserId) {
            const recipientId = selectedUserId;
            socket.emit('private message', {
                recipientId,
                content: message
            });
            appendMessageToChat(message, true);
            chatInput.value = '';
            scrollToBottom();
        }
    });

    // Listen for the 'private message' event from the server and update the user interface
    socket.on('private message', (msg) => {
        console.log("Private message received:", msg);
        if (msg.recipientId === selectedUserId || msg.senderId === selectedUserId) {
            appendMessageToChat(msg.content);
        }
        loadMessagesForSelectedUser();
    });

    // Handle input in the user search field
    const userSearchInput = document.getElementById('userSearchInput');
    userSearchInput.addEventListener('input', () => {
        const filterText = userSearchInput.value.trim();
        renderUserList(filterText);
    });

    // Initialize the user list on initial page load
    renderUserList();
});


// PARTICIPATE EVENT ----------------------------------------------------------------------------------------------------------------------------------------------------
// Connect to the Socket.IO server
socket = io();

async function openChatWithCreator(eventId, socket) {
    socket = io();
    try {
        const [eventData, participantRequestsData] = await Promise.all([
            fetch(`/getEventCreatorId/${eventId}`).then(res => res.json()),
            fetch(`/getParticipantRequests/${eventId}`).then(res => res.json())
        ]);

        if (eventData.success && eventData.creatorId) {
            const creatorId = eventData.creatorId;
            modalBackgroundChat.style.display = 'flex';
            selectedUserId = creatorId;

            if (selectedUserId) {
                clearChatMessages();

                if (participantRequestsData && participantRequestsData.success) {
                    const requests = participantRequestsData.participantRequests;
                    if (requests.length > 0) {
                        requests.forEach(request => {
                            if (request.status === 'Pending') {
                                processParticipantRequest(eventId, request.userId, creatorId, socket);
                            }
                        });
                    } else {
                        console.log('No participant requests.');
                    }
                } else {
                    console.error('Error fetching participant requests.');
                }

                const messages = await fetchMessagesForUser(selectedUserId);
                renderMessages(messages);
                await loadMessagesForSelectedUser();

                const creatorUsername = eventData.creatorUsername;
                const userListContainer = document.getElementById('userList');
                userListContainer.innerHTML = '';

                const creatorNameElement = document.createElement('div');
                creatorNameElement.textContent = `Ask ${creatorUsername} to join!`;
                creatorNameElement.classList.add('user-selected');
                creatorNameElement.addEventListener('click', async () => {
                    selectedUserId = null;
                    creatorNameElement.classList.remove('user-selected');
                    chatInput.style.display = 'flex';
                    userListContainer.innerHTML = '';
                    clearChatMessages();
                    renderUserList(filterText);
                });
                userListContainer.appendChild(creatorNameElement);

                const chatInput = document.getElementById('userSearchInput');
                chatInput.style.display = 'none';
            } else {
                console.log('Selected user ID is not defined. Skipping message retrieval.');
            }
        } else {
            console.error('Event creator ID not found.');
        }
    } catch (error) {
        console.error('Error opening chat with event creator:', error);
    }
}


async function processParticipantRequest(eventId, userId, selectedUserId, socket) {
    try {
        // Get the username of the user requesting to participate in the event
        const userResponse = await fetch(`/users`);
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }
        const usersData = await userResponse.json();
        const user = usersData.find(user => user._id === userId);
        if (!user) {
            console.error('User not found');
            return;
        }
        const userUsername = user.username;

        const acceptLink = `<a href="#" class="accept-request-button" onclick="handleParticipantRequest('${eventId}', '${userId}', 'accept')">Accept</a>`;
        const rejectLink = `<a href="#" class="reject-request-button" onclick="handleParticipantRequest('${eventId}', '${userId}', 'reject')">Reject</a>`;
        const messageContent = `User "${userUsername}" wants to participate in your event. Do you want to accept or reject? ${acceptLink} | ${rejectLink}`;

        if (socket) {
            // Send the message to the event creator via Socket.IO
            socket.emit('private message', {
                senderId: userId,
                recipientId: selectedUserId,
                content: messageContent
            });
        } else {
            console.error('Socket is not defined.');
        }
    } catch (error) {
        console.error('Error processing participant request:', error);
    }
}


// Function to participate in an event
async function participateInEvent(eventId, socket) {
    try {
        const userId = await getUserIdFromSession();

        if (!userId) {
            console.error('User ID not found in session.');
            return;
        }

        const hasRequested = await checkParticipantRequest(eventId, userId);
        if (hasRequested) {
            console.log('You have already sent a participation request for this event.');
            return;
        }

        const response = await fetch(`/participate/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success && responseData.message) {
                console.log(responseData.message);
                openChatWithCreator(eventId, socket);

            } else {
                console.error('Failed to participate in the event.');
            }
        } else {
            console.error('Failed to participate in the event.');
        }
    } catch (error) {
        console.error('Error participating in the event:', error);
    }
}

async function handleParticipantRequest(eventId, userId, action) {
    try {
        console.log('Event ID:', eventId);
        console.log('User ID:', userId);
        console.log('Action:', action);

        if (action === 'accept') {
            alert('Woohoo! You\'ve just high-fived the participant request! Let them know they\'re in!');

        } else if (action === 'reject') {
            alert('Oops! Participant request rejected! Time to break the news gently!');
        }
        const response = await fetch(`/handleParticipantRequest/${eventId}/${userId}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });


        if (!response.ok) {
            throw new Error('Error handling participant request: ' + response.statusText);
        }

        const eventData = await response.json();

        if (!eventData.success) {
            console.error('Error handling participant request:', eventData.error);
            return;
        }

        console.log('Participant request ' + action + 'ed successfully');
    } catch (error) {
        console.error('Error handling participant request:', error);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const modalBackgroundChat = document.getElementById('modalBackgroundChat');


    // Hide modal background by default
    modalBackgroundChat.style.display = 'none';
    openChatWithCreator(eventId, socket);



    // Handle the event to participate in an event
    document.querySelectorAll('.participate-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const eventId = button.dataset.eventId;
            participateInEvent(eventId, socket);
        });
    });

    // Handle the event to accept or reject a participant request
    document.querySelectorAll('.accept-request-button, .reject-request-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const eventId = button.dataset.eventId;
            const userId = button.dataset.userId;
            const action = button.classList.contains('accept-request-button') ? 'accept' : 'reject';
            handleParticipantRequest(eventId, userId, action, socket);

        });
    });

    // Handle the event to display the chat box when clicking on a message link
    document.querySelectorAll('.message').forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            console.log('Clicked on message link.');
            modalBackgroundChat.style.display = 'flex';
            selectedUserId = link.dataset.userId;
            console.log("Selected User ID:", selectedUserId);
            if (selectedUserId) {
                const messages = await fetchMessagesForUser(selectedUserId);
                renderMessages(messages);
                await loadMessagesForSelectedUser();
            } else {
                console.log('Selected user ID is undefined. Skipping message fetching.');
            }
        });
    });

    // Handle chat form submission
    const chatForm = document.getElementById('chatForm');
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message !== '' && selectedUserId) {
            const recipientId = selectedUserId;
            socket.emit('private message', {
                recipientId,
                content: message
            });
            appendMessageToChat(message, true);
            chatInput.value = '';
            scrollToBottom();
        }
    });

    // Listen for 'private message' event from the server and update the UI
    socket.on('private message', (msg) => {
        console.log("Private message received:", msg);
        if (msg.recipientId === selectedUserId || msg.senderId === selectedUserId) {
            appendMessageToChat(msg.content);
        }
        loadMessagesForSelectedUser();
    });

    // Initialize the user list on initial load
    renderUserList();
});


async function checkParticipantRequest(eventId, userId) {
    try {
        // Send a GET request to fetch participant requests for this event
        const response = await fetch(`/getParticipantRequests/${eventId}`);
        if (!response.ok) {
            console.error('Failed to fetch participant requests for the event.');
            return false;
        }

        const requestData = await response.json();
        if (!requestData.success || !requestData.participantRequests) {
            console.error('No participant requests found for the event.');
            return false;
        }

        // Check if the user has already sent a participant request
        const existingRequest = requestData.participantRequests.find(request => request.userId === userId);
        return existingRequest !== undefined;
    } catch (error) {
        console.error('Error checking participant request:', error);
        return false;
    }
}
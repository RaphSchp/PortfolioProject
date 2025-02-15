// ================================
// CHAT SYSTEM - USER & MESSAGES HANDLING
// ================================

let selectedUserId = null; // Stores the ID of the currently selected user

// Retrieves the logged-in user's ID from the session.
async function getUserIdFromSession() {
    try {
        const response = await fetch('/getLoggedInUserInfo'); // Fetch user session data from the server
        const data = await response.json(); // Convert response to JSON

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

// Closes the chat modal by hiding its background.
function closeChatBox() {
    document.getElementById('modalBackgroundChat').style.display = 'none';
}

// Scrolls the chat messages container to the bottom.
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Adds a message to the chat window.
function appendMessageToChat(message, isSentByCurrentUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');

    // Apply appropriate CSS class based on the sender
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

// Clears all chat messages from the chat container.
function clearChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
}

// Retrieves chat messages exchanged with a specific user.
async function fetchMessagesForUser(userId) {
    try {
        if (!userId) {
            console.log('User ID is undefined. Skipping message fetching.');
            return [];
        }

        console.log('Fetching messages for user:', userId);
        const response = await fetch(`/messages/${userId}`); // Request chat history

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json(); // Convert response to JSON
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

// Displays messages in the chat window.
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

// Loads the conversation history for the currently selected user.
async function loadMessagesForSelectedUser() {
    try {
        if (selectedUserId) {
            console.log('Loading messages for selected user:', selectedUserId);
            clearChatMessages(); // Clear previous messages before loading new ones
            const messages = await fetchMessagesForUser(selectedUserId);
            renderMessages(messages);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Displays a list of users based on the search input.
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
            userListContainer.innerHTML = ''; // Clear previous user list

            if (filterText.trim() === '') {
                userListContainer.style.display = 'none'; // Hide list if no input
                return;
            }

            let count = 0; // Limit displayed users to 4

            users.forEach(user => {
                if (count >= 4) return;

                if (user.username.toLowerCase().includes(filterText.toLowerCase())) {
                    const userElement = document.createElement('div');
                    userElement.textContent = user.username;
                    userElement.dataset.userId = user._id;
                    userElement.classList.add('user-item');

                    // Handles user selection from the search results
                    userElement.addEventListener('click', async () => {
                        selectedUserId = user._id;
                        console.log("Selected User ID:", selectedUserId);

                        // Immediately add user to the chat container
                        addUserToChatContainer(user);

                        // Refresh the chat container dynamically after a short delay
                        setTimeout(() => {
                            loadUserConversations().then(() => {
                                applyHighlightToConversation(selectedUserId);
                            });
                        }, 300);

                        // Load the conversation
                        await loadMessagesForSelectedUser();

                        // Reset search input
                        chatInput.value = '';
                        userListContainer.innerHTML = '';
                        userListContainer.style.display = 'none';
                    });

                    userListContainer.appendChild(userElement);
                    count++; // Increase the count limit to only display 4 users
                }
            });

            // Hide list if no users match the search
            userListContainer.style.display = userListContainer.innerHTML ? 'block' : 'none';
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

// ================================
// CHAT SYSTEM - USER SELECTION & MESSAGE HANDLING
// ================================

// Adds a user to the chat container and highlights the selected conversation.
function addUserToChatContainer(user) {
    const chatContainer = document.getElementById('chat-container');

    // Check if the user already exists in the chat container
    let existingUser = document.querySelector(`[data-user-id="${user._id}"]`);

    if (existingUser) {
        // Remove highlight from all conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('selected-conversation');
        });

        // Apply highlight and load messages
        existingUser.classList.add('selected-conversation');
        selectedUserId = user._id;
        clearChatMessages();
        loadMessagesForSelectedUser();
        return;
    }

    // Create a new conversation element for the user
    const conversationElement = document.createElement('div');
    conversationElement.classList.add('conversation-item');
    conversationElement.dataset.userId = user._id;

    // Create user profile picture
    const userPic = document.createElement('img');
    userPic.src = `../../assets/user_image/${user.userpic}`;
    userPic.alt = `${user.username}'s picture`;
    userPic.classList.add('user-pic');

    // Create username label
    const username = document.createElement('span');
    username.textContent = user.username;
    username.classList.add('username');

    conversationElement.appendChild(userPic);
    conversationElement.appendChild(username);

    // Add the conversation to the chat container
    chatContainer.appendChild(conversationElement);

    // Apply highlight after updating the chat container
    setTimeout(() => {
        // Remove highlight from all conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('selected-conversation');
        });

        // Apply highlight to the newly added conversation
        conversationElement.classList.add('selected-conversation');
        selectedUserId = user._id;
        clearChatMessages();
        loadMessagesForSelectedUser();
    }, 200); // Small delay to prevent instant removal of the class

    // Add click event listener to select conversation
    conversationElement.addEventListener('click', async () => {
        // Remove highlight from all conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('selected-conversation');
        });

        // Apply highlight
        conversationElement.classList.add('selected-conversation');

        // Load the selected user's messages
        selectedUserId = user._id;
        clearChatMessages();
        await loadMessagesForSelectedUser();
    });
}

let socket;

// Handles chat events when the document is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const modalBackgroundChat = document.getElementById('modalBackgroundChat');
    
    // Load existing user conversations on page load
    loadUserConversations();

    // Hide chat modal background by default
    modalBackgroundChat.style.display = 'none';

    // Handle click event to open chat box when clicking a message link
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

    // Handles sending messages via the chat form
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (message !== '' && selectedUserId) {
            const recipientId = selectedUserId;

            // Send message through WebSocket
            socket.emit('private message', {
                recipientId,
                content: message
            });

            // Append the message to the chat and reset input field
            appendMessageToChat(message, true);
            chatInput.value = '';
            scrollToBottom();

            // Store the active conversation before refreshing
            const activeConversationId = selectedUserId;

            // Wait for chat container update before reapplying highlight
            setTimeout(() => {
                loadUserConversations().then(() => {
                    applyHighlightToConversation(activeConversationId);
                });
            }, 300);
        }
    });

    // Handles receiving messages from the server
    socket.on('private message', (msg) => {
        console.log("Private message received:", msg);

        if (msg.recipientId === selectedUserId || msg.senderId === selectedUserId) {
            appendMessageToChat(msg.content);
        }

        // Store the active conversation before refreshing
        const activeConversationId = selectedUserId;

        loadMessagesForSelectedUser();
        loadUserConversations().then(() => {
            applyHighlightToConversation(activeConversationId);
        });
    });

    // Handles user search field input
    const userSearchInput = document.getElementById('userSearchInput');
    userSearchInput.addEventListener('input', () => {
        const filterText = userSearchInput.value.trim();
        renderUserList(filterText);
    });

    // Initialize the user list on page load
    renderUserList();
});



// ================================
// PARTICIPATE EVENT - CHAT SYSTEM
// ================================

// Establish a connection to the Socket.IO server
socket = io();

/**
 * Opens a chat with the event creator.
 * Retrieves the event creator's ID and participant requests, then loads the chat interface.
 */
async function openChatWithCreator(eventId, socket) {
    socket = io(); // Ensure the socket connection is active

    try {
        // Fetch event creator ID and participant requests in parallel
        const [eventData, participantRequestsData] = await Promise.all([
            fetch(`/getEventCreatorId/${eventId}`).then(res => res.json()),
            fetch(`/getParticipantRequests/${eventId}`).then(res => res.json())
        ]);

        if (eventData.success && eventData.creatorId) {
            const creatorId = eventData.creatorId;
            modalBackgroundChat.style.display = 'flex';
            selectedUserId = creatorId;

            if (selectedUserId) {
                clearChatMessages(); // Clear previous chat messages

                // Process participant requests if any exist
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

                // Fetch and display messages in the chat window
                const messages = await fetchMessagesForUser(selectedUserId);
                renderMessages(messages);
                await loadMessagesForSelectedUser();

                // Update UI to highlight the creator in the user list
                const creatorUsername = eventData.creatorUsername;
                const userListContainer = document.getElementById('userList');
                userListContainer.innerHTML = '';

                // Create an element representing the event creator in the user list
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

                // Hide the search input after selecting the creator
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

/**
 * Processes a participant request to join an event.
 * Retrieves user information and sends a request to the event creator.
 */
async function processParticipantRequest(eventId, userId, selectedUserId, socket) {
    try {
        // Fetch user data to get the username
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

        // Create accept and reject action links
        const acceptLink = `<a href="#" class="accept-request-button" onclick="handleParticipantRequest('${eventId}', '${userId}', 'accept')">Accept</a>`;
        const rejectLink = `<a href="#" class="reject-request-button" onclick="handleParticipantRequest('${eventId}', '${userId}', 'reject')">Reject</a>`;
        const messageContent = `User "${userUsername}" wants to participate in your event. Do you want to accept or reject? ${acceptLink} | ${rejectLink}`;

        if (socket) {
            // Send the request message to the event creator via WebSocket
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

/**
 * Allows a user to participate in an event.
 * Sends a participation request to the server and opens a chat with the event creator.
 */
async function participateInEvent(eventId, socket) {
    try {
        const userId = await getUserIdFromSession();

        if (!userId) {
            console.error('User ID not found in session.');
            return;
        }

        // Check if the user has already sent a participation request
        const hasRequested = await checkParticipantRequest(eventId, userId);
        if (hasRequested) {
            console.log('You have already sent a participation request for this event.');
            return;
        }

        // Send participation request to the server
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

/**
 * Handles a participant request (accept or reject).
 * Logs the action and sends a request to update the status in the backend.
 */
async function handleParticipantRequest(eventId, userId, action) {
    try {
        console.log('Event ID:', eventId);
        console.log('User ID:', userId);
        console.log('Action:', action);

        // Display an alert based on the action
        if (action === 'accept') {
            alert("You have accepted the participant request.");
        } else if (action === 'reject') {
            alert("You have rejected the participant request.");
        }

        // Send request to update the participant's status
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

// ==============================
// EVENT LISTENERS AND CHAT SETUP
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const modalBackgroundChat = document.getElementById('modalBackgroundChat');

    // Hide chat modal by default
    modalBackgroundChat.style.display = 'none';

    // Open chat with event creator when page loads
    openChatWithCreator(eventId, socket);

    // Handle click event on participation buttons
    document.querySelectorAll('.participate-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const eventId = button.dataset.eventId;
            participateInEvent(eventId, socket);
        });
    });

    // Handle click event on accept/reject participant requests
    document.querySelectorAll('.accept-request-button, .reject-request-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const eventId = button.dataset.eventId;
            const userId = button.dataset.userId;
            const action = button.classList.contains('accept-request-button') ? 'accept' : 'reject';
            handleParticipantRequest(eventId, userId, action, socket);
        });
    });

    // Open chat when clicking on a message
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

    // Handle chat message sending
    const chatForm = document.getElementById('chatForm');
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (message !== '' && selectedUserId) {
            const recipientId = selectedUserId;

            // Send the message via WebSocket
            socket.emit('private message', {
                recipientId,
                content: message
            });

            // Display the message in the chat window
            appendMessageToChat(message, true);
            chatInput.value = '';
            scrollToBottom();

            // Store the active conversation before refreshing
            const activeConversationId = selectedUserId;

            // Refresh chat container and reapply highlight
            setTimeout(() => {
                loadUserConversations().then(() => {
                    let activeConversation = document.querySelector(`[data-user-id="${activeConversationId}"]`);
                    if (activeConversation) {
                        document.querySelectorAll('.conversation-item').forEach(item => {
                            item.classList.remove('selected-conversation');
                        });
                        activeConversation.classList.add('selected-conversation');
                    }
                });
            }, 300);
        }
    });

    // Listen for incoming messages and update chat
    socket.on('private message', (msg) => {
        console.log("Private message received:", msg);
        if (msg.recipientId === selectedUserId || msg.senderId === selectedUserId) {
            appendMessageToChat(msg.content);
        }
        loadMessagesForSelectedUser();
    });

    // Initialize user search list on page load
    renderUserList();
});

/**
 * Checks if a user has already sent a participation request.
 * Fetches the request data from the server.
 */
async function checkParticipantRequest(eventId, userId) {
    try {
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

        // Check if the user has already requested participation
        return requestData.participantRequests.some(request => request.userId === userId);
    } catch (error) {
        console.error('Error checking participant request:', error);
        return false;
    }
}

// Loads user conversations and updates the chat container.
async function loadUserConversations() {
    try {
        const response = await fetch('/getUserConversations');
        const data = await response.json();
        const chatContainer = document.getElementById('chat-container');

        chatContainer.innerHTML = '';

        if (!data.success || data.conversations.length === 0) {
            chatContainer.innerHTML = '<p>No conversation</p>';
            chatContainer.classList.add('no-conversation');
            return;
        }

        // Render each conversation in the chat container
        data.conversations.forEach(conversation => {
            const conversationElement = document.createElement('div');
            conversationElement.classList.add('conversation-item');
            conversationElement.dataset.userId = conversation.userId;

            // Profile picture
            const userPic = document.createElement('img');
            userPic.src = `../../assets/user_image/${conversation.userpic}`;
            userPic.alt = `${conversation.username}'s picture`;
            userPic.classList.add('user-pic');

            // Username
            const username = document.createElement('span');
            username.textContent = conversation.username;
            username.classList.add('username');

            conversationElement.appendChild(userPic);
            conversationElement.appendChild(username);

            // Handle conversation selection and highlight
            conversationElement.addEventListener('click', async () => {
                document.querySelectorAll('.conversation-item').forEach(item => {
                    item.classList.remove('selected-conversation');
                });

                conversationElement.classList.add('selected-conversation');

                selectedUserId = conversation.userId;
                document.getElementById('modalBackgroundChat').style.display = 'flex';
                await loadMessagesForSelectedUser();
            });

            chatContainer.appendChild(conversationElement);
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

//Applies highlighting to the currently active conversation.
function applyHighlightToConversation(userId) {
    let activeConversation = document.querySelector(`[data-user-id="${userId}"]`);
    if (activeConversation) {
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('selected-conversation');
        });
        activeConversation.classList.add('selected-conversation');
    }
}

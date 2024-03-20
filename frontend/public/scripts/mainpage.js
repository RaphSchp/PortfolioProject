// Global variable to keep track of rendered event IDs
let renderedEventIds = new Set();
let figures = [];

// FETCH DATA -----------------------------------------------------------------------------------------------------------------------------------------------------------

//
document.addEventListener("DOMContentLoaded", async () => {
    // Retrieve user information from the server
    const response = await fetch("/getLoggedInUserInfo");
    const userData = await response.json();

    // Update form fields with user information
    document.getElementById("username").textContent = userData.username;
    document.getElementById("email").textContent = userData.email;

});

//

document.addEventListener("DOMContentLoaded", () => {
    let options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(document.querySelector("footer"));

    getData();
});

function handleIntersect(entries) {
    if (entries[0].isIntersecting) {
        console.warn("Something is intersecting with the viewport");
        getData();
    }
}

function getData() {
    fetch("/events")
        .then(response => response.json())
        .then(events => {
            let main = document.querySelector("main");
            console.log("Using data from MongoDB:", events);

            events.forEach(event => {
                // Check if the event ID has been rendered
                if (!renderedEventIds.has(event._id)) {
                    // Render the event
                    let figure = document.createElement("figure");
                    let img = document.createElement("img");
                    let figcaption = document.createElement("figcaption");
                    let sport = document.createElement("p");
                    let doc = document.createElement("p");
                    let eventHour = document.createElement("p");
                    let eventDate = document.createElement("p");
                    let city = document.createElement("p");
                    let address = document.createElement("p");
                    let participants = document.createElement("p");
                    let status = document.createElement("p");

                    img.src = "../../assets/user_image/" + event.img;
                    img.alt = event.event_name;
                    figcaption.textContent = event.event_name;
                    doc.textContent = event.doc;
                    doc.classList.add("doc");

                    // Sport
                    let sportLabel = createLabelSpan("Sport: ");
                    let sportValue = document.createElement("span");
                    sportValue.textContent = event.sport;
                    sport.textContent = "";
                    sport.appendChild(sportLabel);
                    sport.appendChild(sportValue);
                    sport.classList.add("sport");

                    // Event Hour
                    let eventHourLabel = createLabelSpan("Event Hour: ");
                    let eventHourValue = document.createElement("span");
                    eventHourValue.textContent = event.event_hour;
                    eventHour.textContent = "";
                    eventHour.appendChild(eventHourLabel);
                    eventHour.appendChild(eventHourValue);
                    eventHour.classList.add("event-hour");

                    // Event Date
                    let eventDateLabel = createLabelSpan("Event Date: ");
                    let eventDateValue = document.createElement("span");
                    eventDateValue.textContent = event.event_date;
                    eventDate.textContent = "";
                    eventDate.appendChild(eventDateLabel);
                    eventDate.appendChild(eventDateValue);
                    eventDate.classList.add("event-date");

                    // City
                    let cityLabel = createLabelSpan("City: ");
                    let cityValue = document.createElement("span");
                    cityValue.textContent = event.city;
                    city.textContent = "";
                    city.appendChild(cityLabel);
                    city.appendChild(cityValue);
                    city.classList.add("city");

                    // Address
                    let addressLabel = createLabelSpan("Address: ");
                    let addressValue = document.createElement("span");
                    addressValue.textContent = event.address;
                    address.textContent = "";
                    address.appendChild(addressLabel);
                    address.appendChild(addressValue);
                    address.classList.add("address");

                    // Participants
                    let participantsLabel = createLabelSpan("Participants: ");
                    let participantsValue = document.createElement("span");
                    participantsValue.textContent = event.participants;
                    participants.textContent = "";
                    participants.appendChild(participantsLabel);
                    participants.appendChild(participantsValue);
                    participants.classList.add("participants");

                    // Status
                    let statusLabel = createLabelSpan("Status: ");
                    let statusValue = document.createElement("span");
                    statusValue.textContent = event.status;
                    status.textContent = "";
                    status.appendChild(statusLabel);
                    status.appendChild(statusValue);
                    status.classList.add("status");

                    let participateIcon = createIconLink("../../assets/images/participate.png", "#participate-link");
                    participateIcon.addEventListener("click", () => participateInEvent(event._id));
                    let messageIcon = createIconLink("../../assets/images/message.png", "#message-link");
                    let favoritesIcon = createIconLink("../../assets/images/favorites.png", "#favorites-link");

                    figure.appendChild(img);
                    figure.appendChild(figcaption);
                    figure.appendChild(sport);
                    figure.appendChild(doc);
                    figure.appendChild(eventHour);
                    figure.appendChild(eventDate);
                    figure.appendChild(city);
                    figure.appendChild(address);
                    figure.appendChild(participants);
                    figure.appendChild(status);
                    figure.appendChild(participateIcon);
                    figure.appendChild(messageIcon);
                    figure.appendChild(favoritesIcon);

                    main.appendChild(figure);

                    // Add the event ID to the set of rendered IDs
                    renderedEventIds.add(event._id);
                }
            });

            // Update the figures array after rendering new events
            figures = Array.from(document.querySelectorAll("figure"));
        })
        .catch(error => console.error("Error fetching data:", error));
}

function createLabelSpan(labelText) {
    let labelSpan = document.createElement("span");
    labelSpan.textContent = labelText;
    labelSpan.style.color = "#f1600d";
    return labelSpan;
}

function createIconLink(src, href) {
    let iconLink = document.createElement("a");
    iconLink.href = href;

    let icon = document.createElement("img");
    icon.src = src;
    icon.alt = "";
    icon.classList.add("action-icon");

    iconLink.appendChild(icon);

    return iconLink;
}

document.addEventListener("DOMContentLoaded", () => {
    fetch('/getLoggedInUserInfo')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Select all userpic elements by their ID
                const userpics = document.querySelectorAll('#userpic, #userpic2');

                // Iterate over each userpic and update its src and alt
                userpics.forEach(userpic => {
                    userpic.src = `../../assets/user_image/${data.userpic}`;
                    userpic.alt = 'User Profile';
                });
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Error fetching user info:', error));
});



// SCROLL DOWN NAV BAR + UP BUTTON --------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const topnavSection = document.getElementById("myTopnav");
    let mybutton = document.getElementById("myBtn");

    let options = {
        root: null,
        rootMargin: "0px",
        threshold: 0
    };

    // Initialize the button display
    toggleButtonDisplay();

    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(topnavSection);

    function handleIntersect(entries) {
        const entry = entries[0];
        const isTopnavVisible = entry.isIntersecting;
        const isTopScrolled = window.scrollY > 20;

        if (!isTopnavVisible && isTopScrolled) {
            navbar.style.top = "0";
        } else {
            navbar.style.top = "-100px";
        }

        // Update button display on intersect
        toggleButtonDisplay();
    }

    window.addEventListener("scroll", toggleButtonDisplay);

    function toggleButtonDisplay() {
        // Get the button:
        let mybutton = document.getElementById("myBtn");

        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }

    // Scroll to top when the button is clicked
    mybutton.addEventListener("click", () => {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    });

});

// NAVIGATION SIDE BAR --------------------------------------------------------------------------------------------------------------------------------------------------
function openMenuNav() {
    const menuNav = document.getElementById("menuNav");
    menuNav.classList.add("show-border");
    menuNav.style.width = "250px";
}

function closeMenuNav() {
    const menuNav = document.getElementById("menuNav");
    menuNav.classList.remove("show-border");
    menuNav.style.width = "0";
}

// CREATE EVENT BOX -----------------------------------------------------------------------------------------------------------------------------------------------------

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
        // Function to check the length of text in the eventDescription field
        function checkDescriptionLength() {
            var description = document.getElementById('eventDescription').value;
            var maxLength = 140; // Limite maximale de caractères

            // Checks if the text length exceeds the maximum limit
            if (description.length > maxLength) {
                // If yes, truncate the text to the maximum limit
                document.getElementById('eventDescription').value = description.substring(0, maxLength);
            }
        }

        // Attach the checkDescriptionLength function to the 'input' event of the eventDescription field
        document.getElementById('eventDescription').addEventListener('input', checkDescriptionLength);
    });
    document.getElementById('eventImage').addEventListener('change', function() {
        var fileName = this.files[0].name;
        document.getElementById('fileNamePlaceholder').textContent = fileName;
    });
});

function closeEventBox() {
    document.getElementById('modalBackground').style.display = 'none';
}

function submitEvent() {
    // After handling the submission, hide the modal
    const modalBackground = document.getElementById('modalBackground');
    modalBackground.style.display = 'none';
}


// HANDLE REGISTRATION EVENT --------------------------------------------------------------------------------------------------------------------------------------------

let fileName = "";

function uploadImage() {
    var fileInput = document.getElementById("eventImage");
    if (fileInput.files.length > 0) {
        fileName = fileInput.files[0].name;

    } else {
        console.log("No file selected.");
        return;
    }
    console.log("Selected file name:", fileName);

}




function handleRegistrationEvent() {
    const event_name = document.getElementById('eventName').value;
    const sport = document.getElementById('eventSport').value;
    const doc = document.getElementById('eventDescription').value;
    const event_hour = document.getElementById('eventHour').value;
    const event_date = document.getElementById('eventDate').value;
    const city = document.getElementById('eventCity').value;
    const address = document.getElementById('eventAddress').value;
    const participants = document.getElementById('participants').value;

    const statusCheckbox = document.getElementById('status');
    const status = statusCheckbox.checked ? 'Open' : 'Demand';

    // Create a new FormData object
    const formData = new FormData();
    // Add the image to the FormData
    const fileInput = document.getElementById('eventImage');
    const file = fileInput.files[0];
    formData.append('eventImage', file);

    // Send the request to upload the image
    fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Retrieve the filename of the uploaded image
                const img = data.filename;

                // Send other form data as JSON
                fetch('/registerevent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            event_name,
                            userpic,
                            img,
                            sport,
                            doc,
                            event_hour,
                            event_date,
                            city,
                            address,
                            participants,
                            status,
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                            console.log('Event registration successful:', data);
                        } else {
                            alert(data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error during registration event:', error);
                        alert('An error occurred. Please try again later.');
                    });
            } else {
                alert('Image upload failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('An error occurred while uploading the image. Please try again later.');
        });
}


document.addEventListener('DOMContentLoaded', () => {
    const registerEventButton = document.getElementById('registerEvent');
    const boxRegisterEventInput = document.querySelector('.event-box');

    if (registerEventButton) {
        registerEventButton.addEventListener('click', handleRegistrationEvent);
    }

    if (boxRegisterEventInput) {
        boxRegisterEventInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleRegistrationEvent();
            }
        });
    }
});




// PROFILE BOX ----------------------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.querySelectorAll('.user-profile a');
    const modalBackground2 = document.getElementById('modalBackground2');

    // Hide modal background by default
    modalBackground2.style.display = 'none';

    profileLink.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            modalBackground2.style.display = 'flex';
        });
    });
});

function closeProfileBox() {
    document.getElementById('modalBackground2').style.display = 'none';
}

function editProfile() {
    // Logic to handle form submission
    // ...

    // After handling the submission, hide the modal
    const modalBackground = document.getElementById('modalBackground2');
    modalBackground.style.display = 'none';
}

// Function to logout on the client-side
function logout() {
    fetch('/logout', {
            method: 'GET'
        })
        .then(response => {
            if (response.ok) {
                // Redirect to the login page once logged out
                window.location.href = '/login';
            } else {
                console.error('Erreur lors de la déconnexion:', response.statusText);

            }
        })
        .catch(error => {
            console.error('Erreur lors de la déconnexion:', error);

        });
}



// AUTO-FILL WITH SPORTS.JSON -------------------------------------------------------------------------------------------------------------------------------------------
// Fetch the list of sports as soon as the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
    // Fetch the list of sports from the JSON file
    const sports = await fetchSports();

    // Listen for events on the input to filter sports
    const eventSportInput = document.getElementById('eventSport');
    eventSportInput.addEventListener('input', () => filterSports(sports));
});

async function fetchSports() {
    try {
        const response = await fetch('/sports.json');
        const data = await response.json();
        return data.sports;
    } catch (error) {
        console.error('Error fetching sports:', error);
        return []; // Return an empty array in case of error
    }
}


// Function to filter sports and update the datalist
function filterSports(sports) {
    var input, filter, datalist, sportOptions, i;
    input = document.getElementById("eventSport");
    filter = input.value.toLowerCase();
    datalist = document.getElementById("sportsList");

    // If the input value is empty, remove the datalist
    if (filter === "") {
        if (datalist) {
            datalist.remove();
        }
        return;
    }

    // Create the datalist if it doesn't exist
    if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = "sportsList";
        input.parentNode.appendChild(datalist);
    }

    // Clear previous options
    datalist.innerHTML = "";

    // Populate datalist with matching sports
    for (i = 0; i < sports.length; i++) {
        if (sports[i].toLowerCase().startsWith(filter)) {
            var option = document.createElement("option");
            option.value = sports[i];
            datalist.appendChild(option);
            // Limite à 5 options
            if (datalist.childNodes.length >= 5) {
                break;
            }
        }
    }
}

// SEARCH FUNCTION ------------------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const searchInputs = document.querySelectorAll("#navbar-search-input, #topnav-search-input");
    const navbarSearchButton = document.getElementById("navbar-search-button");
    const topnavSearchButton = document.getElementById("topnav-search-button");

    // Event listener for the button clicks
    navbarSearchButton.addEventListener("click", handleNavbarSearch);
    topnavSearchButton.addEventListener("click", handleTopnavSearch);

    function handleNavbarSearch() {
        handleSearch("navbar-search-input");
    }

    function handleTopnavSearch() {
        handleSearch("topnav-search-input");
    }

    const navbarSearchInput = document.getElementById("navbar-search-input");
    const topnavSearchInput = document.getElementById("topnav-search-input");

    navbarSearchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            handleNavbarSearch();
        }
    });

    topnavSearchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            handleTopnavSearch();
        }
    });

    // Event listener for the "Enter" key in the search inputs
    searchInputs.forEach((searchInput) => {
        searchInput.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                const inputId = searchInput.id;
                handleSearch(inputId);
            }
        });
    });

    // Event listener for the button clicks
    navbarSearchButton.addEventListener("click", () => handleSearch("navbar-search-input"));
    topnavSearchButton.addEventListener("click", () => handleSearch("topnav-search-input"));

    function handleSearch(inputId) {
        const searchTerm = document.getElementById(inputId).value.toLowerCase();

        // Loop through all figures and toggle display based on search term
        const allFigures = Array.from(document.querySelectorAll("main figure, #myTopnav figure"));
        allFigures.forEach((figure) => {
            const figCaptionText = figure.querySelector("figcaption").textContent.toLowerCase();
            const docText = figure.querySelector(".doc").textContent.toLowerCase();
            const eventHourText = figure.querySelector(".event-hour span:last-child").textContent.toLowerCase();
            const sportText = figure.querySelector(".sport span:last-child").textContent.toLowerCase();
            const addressText = figure.querySelector(".address span:last-child").textContent.toLowerCase();
            const eventDateText = figure.querySelector(".event-date span:last-child").textContent.toLowerCase();
            const cityText = figure.querySelector(".city span:last-child").textContent.toLowerCase();
            const participantsText = figure.querySelector(".participants span:last-child").textContent.toLowerCase();

            const isMatch =
                figCaptionText.includes(searchTerm) ||
                docText.includes(searchTerm) ||
                eventHourText.includes(searchTerm) ||
                sportText.includes(searchTerm) ||
                addressText.includes(searchTerm) ||
                eventDateText.includes(searchTerm) ||
                cityText.includes(searchTerm) ||
                participantsText.includes(searchTerm);

            if (isMatch) {
                figure.style.display = "block"; // Show the figure
            } else {
                figure.style.display = "none"; // Hide the figure
            }
        });
    }
});

// FILTERS --------------------------------------------------------------------------------------------------------------------------------------------------------------

// ** SPORT -------------------------------------------------------------------------------------------------------------------------------------------------------------
// Fetch sports list from the server
async function fetchSportsList() {
    try {
        const response = await fetch('/sports.json');
        const data = await response.json();
        return data.sports;
    } catch (error) {
        console.error('Error fetching sports list:', error);
        return [];
    }
}

// Function to handle applying sport filter
async function applySportFilter() {
    const selectedSport = document.getElementById('sportFilter').value.toLowerCase();
    // Loop through all figures and toggle display based on search term
    const allFigures = Array.from(document.querySelectorAll("main figure, #myTopnav figure"));
    allFigures.forEach((figure) => {
        const sportSection = figure.querySelector(".sport").textContent.toLowerCase();

        const isMatch =
            sportSection.includes(selectedSport);

        if (isMatch) {
            figure.style.display = "block";
        } else {
            figure.style.display = "none";
        }
    });
}

// Populate sports dropdown/select
async function populateSportsDropdown() {
    const sportsList = await fetchSportsList();
    const sportDropdown = document.getElementById('sportFilter');
    sportsList.forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport;
        sportDropdown.appendChild(option);
    });
}

// Call the function to populate sports dropdown on page load
document.addEventListener('DOMContentLoaded', () => {
    populateSportsDropdown();
});

// ** DATE --------------------------------------------------------------------------------------------------------------------------------------------------------------
function sortEventsByDate(order) {
    console.log('Sorting events by date:', order); // Check if the function is called and with what order

    // Comparison function to sort events by date
    const compareDates = function(a, b) {
        const dateA = new Date(a.querySelector('.event-date span:last-child').textContent);
        const dateB = new Date(b.querySelector('.event-date span:last-child').textContent);
        return order === 'newer' ? dateB - dateA : dateA - dateB;
    };

    // Sort the figures using the comparison function
    figures.sort(compareDates);

    // Detach the figures from their parent
    figures.forEach(figure => {
        figure.parentNode.removeChild(figure);
    });

    // Re-insert the sorted figures in the correct order
    const main = document.querySelector("main");
    figures.forEach(figure => {
        main.appendChild(figure);
    });
}
// Add an event listener to detect changes in the sorting selection
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("dateSort").addEventListener("change", function() {
        var sortOrder = this.value;
        sortEventsByDate(sortOrder);
    });
});


// ** CITY --------------------------------------------------------------------------------------------------------------------------------------------------------------
// Fetch cities data
async function fetchCitiesData() {
    try {
        const response = await fetch('/cities.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching cities data:', error);
        return [];
    }
}

// Function to filter cities based on input
async function filterCities() {
    const input = document.getElementById('cityInput').value.toLowerCase().trim();
    const suggestionsContainer = document.getElementById('citySuggestions');
    suggestionsContainer.innerHTML = '';

    const cities = await fetchCitiesData();
    const filteredCities = cities.filter(city => city.name.toLowerCase().startsWith(input));

    const suggestionsList = document.createElement('ul');
    suggestionsList.setAttribute('id', 'cityList');

    filteredCities.slice(0, 4).forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.onclick = () => {
            document.getElementById('cityInput').value = `${city.name}, ${city.country}`;
            suggestionsContainer.innerHTML = '';
        };
        suggestionsList.appendChild(li);
    });

    suggestionsContainer.appendChild(suggestionsList);
}

// Function to filter events by selected city
function filterEventsByCity(selectedCity) {
    const city = selectedCity.toLowerCase();

    const allFigures = Array.from(document.querySelectorAll("main figure"));
    allFigures.forEach((figure) => {
        const citySection = figure.querySelector(".city").textContent.toLowerCase();
        const isMatch = citySection.includes(city);

        if (isMatch) {
            figure.style.display = "block";
        } else {
            figure.style.display = "none";
        }
    });
}

// Apply city filter
function applyCityFilter() {
    const selectedCity = document.getElementById('cityInput').value.trim();
    filterEventsByCity(selectedCity);
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const applyButton = document.querySelector("#applyCityFilterButton");
    if (applyButton) {
        applyButton.addEventListener("click", applyCityFilter);
    }

    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('input', filterCities);
    }

    // Call filterCities initially to populate suggestions based on initial input value
    filterCities();
});


function filterEventsByStatus(status) {
    // Check if figures is defined
    if (!figures) return;

    // Loop through all figures and toggle display based on the selected status
    figures.forEach(figure => {
        const eventStatusElement = figure.querySelector('.status');
        if (!eventStatusElement) return; // Ensure .status element is found
        const eventStatus = eventStatusElement.textContent.toLowerCase().trim().replace("status: ", ""); // Extract status without "status: "
        // Show the figure if it matches the selected status or if "All" is selected
        if (status === 'All' || eventStatus === status.toLowerCase()) {
            figure.style.display = 'block';
        } else {
            figure.style.display = 'none';
        }
    });
}


// Add an event listener to detect changes in the status selection
document.addEventListener("DOMContentLoaded", function() {
    const statusSelect = document.getElementById("statusSort");

    // Initially filter based on the default status selection
    const defaultStatus = statusSelect.value;
    filterEventsByStatus(defaultStatus);

    // Add event listener to status select dropdown
    statusSelect.addEventListener("change", function() {
        const selectedStatus = this.value;
        filterEventsByStatus(selectedStatus);
    });
});

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
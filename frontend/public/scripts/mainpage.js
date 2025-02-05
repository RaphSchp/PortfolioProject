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
                    let sportLabel = createLabelSpan("");
                    let sportValue = document.createElement("span");
                    sportValue.textContent = event.sport;
                    sport.textContent = "";
                    sport.appendChild(sportLabel);
                    sport.appendChild(sportValue);
                    sport.classList.add("sport");

                    // Event Hour
                    let eventHourLabel = createLabelSpan("");
                    let eventHourValue = document.createElement("span");
                    eventHourValue.textContent = event.event_hour;
                    eventHour.textContent = "";
                    eventHour.appendChild(eventHourLabel);
                    eventHour.appendChild(eventHourValue);
                    eventHour.classList.add("event-hour");

                    // Event date
                    let eventDateLabel = createLabelSpan("");
                    let eventDateValue = document.createElement("span");
                    eventDateValue.textContent = formatDate(event.event_date);
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
                    let statusLabel = createLabelSpan("");
                    let statusValue = document.createElement("span");
                    statusValue.textContent = event.status;
                    status.textContent = "";
                    status.appendChild(statusLabel);
                    status.appendChild(statusValue);
                    status.classList.add("status");

                    let participateIcon = createIconLink("../../assets/images/participate.png", "#participate-link","Participate");
                    participateIcon.addEventListener("click", () => participateInEvent(event._id));
                    // let messageIcon = createIconLink("../../assets/images/message.png", "#message-link");
                    // let favoritesIcon = createIconLink("../../assets/images/favorites.png", "#favorites-link");

                    figure.appendChild(img);
                    figure.appendChild(sport);
                    figure.appendChild(figcaption);
                    figure.appendChild(doc);
                    figure.appendChild(eventHour);
                    figure.appendChild(eventDate);
                    figure.appendChild(city);
                    figure.appendChild(address);
                    figure.appendChild(participants);
                    figure.appendChild(status);
                    figure.appendChild(participateIcon);
                    // figure.appendChild(messageIcon);
                    // figure.appendChild(favoritesIcon);

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

// Function to format the date
function formatDate(dateString) {
    const date = new Date(dateString); // Convert "YYYY-MM-DD" to Date object

    // Array of months in English
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const day = date.getDate(); // Extract the day (1-31)
    const monthText = months[date.getMonth()]; // Get the month name

    return `${day} ${monthText}`; // Return the formatted date
}

function createLabelSpan(labelText) {
    let labelSpan = document.createElement("span");
    labelSpan.textContent = labelText;
    labelSpan.style.color = "#f1600d";
    return labelSpan;
}

function createIconLink(src, href, text) {

    let iconLink = document.createElement("a");
    iconLink.href = href;
    iconLink.classList.add("action-link");

    let linkText = document.createElement("span");
    linkText.textContent = text;
    linkText.classList.add("link-text");

    iconLink.appendChild(linkText);

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
function toggleMenu() {
    var menu = document.getElementById("menuLinks");
    menu.classList.toggle("open");
}
function toggleMenuNav() {
    var topnav = document.getElementById("myTopnav");
    if (topnav.className === "topnav") {
      topnav.className += " responsive";
    } else {
      topnav.className = "topnav";
    }
  }
  
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
            var maxLength = 140;

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
            // Limit at 5 options
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

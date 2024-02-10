// Global variable to keep track of rendered event IDs
let renderedEventIds = new Set();
let figures = [];

// FETCH DATA -------------------------------------------------------------------------------------------------------------------------------------

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
        if (!renderedEventIds.has(event.id)) {
          // Render the event
          let figure = document.createElement("figure");
          let img = document.createElement("img");
          let figcaption = document.createElement("figcaption");
          let doc = document.createElement("p");
          let eventHour = document.createElement("p");
          let eventDate = document.createElement("p");
          let city = document.createElement("p");
          let address = document.createElement("p");
          let participants = document.createElement("p");

          img.src = event.img;
          img.alt = event.name;
          figcaption.textContent = event.name;
          doc.textContent = event.doc;
          doc.classList.add("doc");

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

          let participateIcon = createIconLink("../../assets/images/participate.png", "#participate-link");
          let messageIcon = createIconLink("../../assets/images/message.png", "#message-link");
          let favoritesIcon = createIconLink("../../assets/images/favorites.png", "#favorites-link");

          figure.appendChild(img);
          figure.appendChild(figcaption);
          figure.appendChild(doc);
          figure.appendChild(eventHour);
          figure.appendChild(eventDate);
          figure.appendChild(city);
          figure.appendChild(address);
          figure.appendChild(participants);
          figure.appendChild(participateIcon);
          figure.appendChild(messageIcon);
          figure.appendChild(favoritesIcon);

          main.appendChild(figure);

          // Add the event ID to the set of rendered IDs
          renderedEventIds.add(event.id);
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

// SCROLL DOWN NAV BAR + UP BUTTON ----------------------------------------------------------------------------------------------------------------
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

// NAVIGATION SIDE BAR ----------------------------------------------------------------------------------------------------------------------------
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
}

function submitEvent() {
  // Add logic to handle form submission
  // ...

  // After handling the submission, hide the modal
  const modalBackground = document.getElementById('modalBackground');
  modalBackground.style.display = 'none';
}

// AUTO-FILL WITH SPORTS.JSON ---------------------------------------------------------------------------------------------------------------------
// Récupérer la liste des sports dès que la page est chargée
document.addEventListener("DOMContentLoaded", async () => {
  // Récupérer la liste des sports depuis le fichier JSON
  const sports = await fetchSports();
  
  // Écouter les événements sur l'input pour filtrer les sports
  const eventSportInput = document.getElementById('eventSport');
  eventSportInput.addEventListener('input', () => filterSports(sports));
});

// Fonction pour récupérer la liste des sports depuis le fichier JSON
async function fetchSports() {
  const response = await fetch('../../../backend/data/sports.json');
  const data = await response.json();
  return data.sports;
}

// Fonction pour filtrer les sports et mettre à jour le datalist
function filterSports(sports) {
  var input, filter, datalist, sportOptions, i;
  input = document.getElementById("eventSport");
  filter = input.value.toLowerCase();
  datalist = document.getElementById("sportsList");

  // Si la valeur de l'input est vide, supprime le datalist
  if (filter === "") {
      if (datalist) {
          datalist.remove();
      }
      return;
  }

  // Crée le datalist s'il n'existe pas
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

// SEARCH FUNCTION --------------------------------------------------------------------------------------------------------------------------------
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
      const eventDateText = figure.querySelector(".event-date span:last-child").textContent.toLowerCase();
      const cityText = figure.querySelector(".city span:last-child").textContent.toLowerCase();
      const participantsText = figure.querySelector(".participants span:last-child").textContent.toLowerCase();

      const isMatch =
        figCaptionText.includes(searchTerm) ||
        docText.includes(searchTerm) ||
        eventHourText.includes(searchTerm) ||
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

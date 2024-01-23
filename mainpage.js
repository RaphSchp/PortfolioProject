// FETCH DATA -------------------------------------------------------------------------------------------------------------------------------------
const URL = "mydata.json";

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
  fetch(URL)
    .then(response => response.json())
    .then(mydata => {
      let main = document.querySelector("main");
      console.log("Using local JSON data", mydata);

      mydata.items.forEach(item => {
        let figure = document.createElement("figure");
        let img = document.createElement("img");
        let figcaption = document.createElement("figcaption");
        let doc = document.createElement("p");
        let eventHour = document.createElement("p");
        let eventDate = document.createElement("p");
        let city = document.createElement("p");
        let participants = document.createElement("p");

        img.src = item.img;
        img.alt = item.name;
        figcaption.textContent = item.name;
        doc.textContent = item.doc;
        doc.classList.add("doc");

        // Event Hour
        let eventHourLabel = createLabelSpan("Event Hour: ");
        let eventHourValue = document.createElement("span");
        eventHourValue.textContent = item.event_hour;
        eventHour.textContent = "";
        eventHour.appendChild(eventHourLabel);
        eventHour.appendChild(eventHourValue);
        eventHour.classList.add("event-hour");

        // Event Date
        let eventDateLabel = createLabelSpan("Event Date: ");
        let eventDateValue = document.createElement("span");
        eventDateValue.textContent = item.event_date;
        eventDate.textContent = "";
        eventDate.appendChild(eventDateLabel);
        eventDate.appendChild(eventDateValue);
        eventDate.classList.add("event-date");

        // City
        let cityLabel = createLabelSpan("City: ");
        let cityValue = document.createElement("span");
        cityValue.textContent = item.city;
        city.textContent = "";
        city.appendChild(cityLabel);
        city.appendChild(cityValue);
        city.classList.add("city");

        // Participants
        let participantsLabel = createLabelSpan("Participants: ");
        let participantsValue = document.createElement("span");
        participantsValue.textContent = item.participants;
        participants.textContent = "";
        participants.appendChild(participantsLabel);
        participants.appendChild(participantsValue);
        participants.classList.add("participants");

        let participateIcon = createIconLink("images/participate.png", "#participate-link");
        let messageIcon = createIconLink("images/message.png", "#message-link");
        let favoritesIcon = createIconLink("images/favorites.png", "#favorites-link");

        figure.appendChild(img);
        figure.appendChild(figcaption);
        figure.appendChild(doc);
        figure.appendChild(eventHour);
        figure.appendChild(eventDate);
        figure.appendChild(city);
        figure.appendChild(participants);
        figure.appendChild(participateIcon);
        figure.appendChild(messageIcon);
        figure.appendChild(favoritesIcon);

        main.appendChild(figure);
      });

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
    })
    .catch(error => console.error("Error fetching data:", error));
}

// SCROLL DOWN NAV BAR ----------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const topnavSection = document.getElementById("myTopnav");

  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0
  };

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
  }

  handleIntersect([{ isIntersecting: false }]);
});

window.onscroll = function () {
  // Additional scroll behavior if needed
  // ...
};

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

// CREATE EVENT BOX --------------------------------------------------------------------------------------------------------------------------------

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

                                                                                        // FETCH DATA
// Set the URL for fetching data
const URL = "mydata.json";

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Options for the IntersectionObserver
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5
  };

  // Create an IntersectionObserver with the defined options and observe the footer
  const observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(document.querySelector("footer"));

  // Call the getData function to fetch and display data
  getData();
});

// Function to handle intersection changes observed by the IntersectionObserver
function handleIntersect(entries) {
  if (entries[0].isIntersecting) {
    // When something is intersecting with the viewport, fetch data
    console.warn("something is intersecting with the viewport");
    getData();
  }
}

// Function to fetch data from the specified URL and display it in the main section
function getData() {
  fetch(URL)
    .then(response => response.json())
    .then(mydata => {
      let main = document.querySelector("main");
      console.log("using local JSON data", mydata);

      mydata.items.forEach(item => {
        // Create HTML elements for each item in the data
        let figure = document.createElement("figure");
        let img = document.createElement("img");
        let figcaption = document.createElement("figcaption");
        let doc = document.createElement("p");

        // Set attributes and content for the created elements
        img.src = item.img;
        img.alt = item.name;
        figcaption.textContent = item.name;
        doc.textContent = item.doc;
        doc.classList.add("doc");

        // Add icons for participate, message, and favorites
        let participateIcon = createIconLink("images/participate.png", "#participate-link");
        let messageIcon = createIconLink("images/message.png", "#message-link");
        let favoritesIcon = createIconLink("images/favorites.png", "#favorites-link");

        // Append the created elements to the main section
        figure.appendChild(img);
        figure.appendChild(figcaption);
        figure.appendChild(doc);
        figure.appendChild(participateIcon);
        figure.appendChild(messageIcon);
        figure.appendChild(favoritesIcon);

        main.appendChild(figure);
      });

      // Function to create an icon link
      function createIconLink(src, href) {
        let iconLink = document.createElement("a");
        iconLink.href = href;

        let icon = document.createElement("img");
        icon.src = src;
        icon.alt = ""; // Add alt text if necessary
        icon.classList.add("action-icon"); // You can apply styles to this class in your CSS

        // Append the icon to the link
        iconLink.appendChild(icon);

        return iconLink;
      }
    })
    .catch(error => console.error("Error fetching data:", error));
}

                                                                                         // SCROLL DOWN NAV BAR
// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get the navbar and topnavSection elements
  const navbar = document.getElementById("navbar");
  const topnavSection = document.getElementById("myTopnav");

  // Options for the IntersectionObserver
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0
  };

  // Create an IntersectionObserver with the defined options and observe the topnavSection
  const observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(topnavSection);

  // Function to handle intersection changes observed by the IntersectionObserver
  function handleIntersect(entries) {
    const entry = entries[0];
    const isTopnavVisible = entry.isIntersecting;
    const isTopScrolled = window.scrollY > 20;

    if (!isTopnavVisible && isTopScrolled) {
      // When the section is not in view and top is scrolled, display the navbar
      navbar.style.top = "0";
    } else {
      // When the section is in view or top is not scrolled, hide the navbar
      navbar.style.top = "-100px";
    }
  }

  // Initial check to determine the initial state
  handleIntersect([{ isIntersecting: false }]);
});

// Event listener for window scroll events
window.onscroll = function() {
  // Additional scroll behavior if needed
  // ...
};
                                                                                         // NAVIGATION SIDE BAR
// Function to open the navigation sidebar
function openMenuNav() {
  const menuNav = document.getElementById("menuNav");
  menuNav.classList.add("show-border");
  menuNav.style.width = "250px";
}

// Function to close the navigation sidebar
function closeMenuNav() {
  const menuNav = document.getElementById("menuNav");
  menuNav.classList.remove("show-border");
  menuNav.style.width = "0";
}

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
    console.warn("something is intersecting with the viewport");
    getData();
  }
}

function getData() {
  fetch(URL)
    .then(response => response.json())
    .then(mydata => {
      let main = document.querySelector("main");
      console.log("using local JSON data", mydata);

      mydata.items.forEach(item => {
        let figure = document.createElement("figure");
        let img = document.createElement("img");
        let doc = document.createElement("p");
        let figcaption = document.createElement("figcaption");
    
        img.src = item.img;
        img.alt = item.name;
        doc.textContent = item.doc;
        doc.classList.add("doc");
        figcaption.textContent = item.name;
    
        figure.appendChild(img);
        figure.appendChild(doc);
        figure.appendChild(figcaption);
        main.appendChild(figure);
    });
    })
    .catch(error => console.error("Error fetching data:", error));
}

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
      // When the section is not in view and top is scrolled, display the navbar
      navbar.style.top = "0";
    } else {
      // When the section is in view or top is not scrolled, hide the navbar
      navbar.style.top = "-100px"; // Adjust this value
    }
  }

  // Initial check to determine the initial state
  handleIntersect([{ isIntersecting: false }]);
});

window.onscroll = function() {
  // Additional scroll behavior if needed
  // ...
};

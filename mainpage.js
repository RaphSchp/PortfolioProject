const URL = "mydata.json";

document.addEventListener("DOMContentLoaded", () => {
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5
  };
  const observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(document.querySelector("footer"));
  getData(); // Initial load of some data
});

function handleIntersect(entries) {
  if (entries[0].isIntersecting) {
    console.warn("something is intersecting with the viewport");
    getData();
  }
}

function getData() {
  // Access URL globally
  fetch(URL)
    .then(response => response.json())
    .then(mydata => {
      let main = document.querySelector("main");
      console.log("using local JSON data", mydata);

      mydata.items.forEach(item => {
        let figure = document.createElement("figure");
        let img = document.createElement("img");
        let figcaption = document.createElement("figcaption");

        img.src = item.img;
        img.alt = item.name;
        figcaption.textContent = item.name;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        main.appendChild(figure);
      });
    })
    .catch(error => console.error("Error fetching data:", error));
}